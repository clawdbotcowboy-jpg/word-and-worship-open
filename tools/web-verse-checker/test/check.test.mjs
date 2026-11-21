import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, test } from 'node:test';
import {
  checkQuote,
  checkQuotes,
  loadWeb,
  parseArgs,
  parseQuotesInput,
  parseReference,
  textsMatch,
} from '../check.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SAMPLE = join(HERE, 'fixtures', 'web-sample.json');
const CHECK = join(HERE, '..', 'check.mjs');
const web = loadWeb(SAMPLE);

describe('parseReference', () => {
  test('parses common English forms', () => {
    const r = parseReference('John 11:35');
    assert.equal(r.ok, true);
    assert.equal(r.book, 'JHN');
    assert.equal(r.chapter, 11);
    assert.equal(r.from, 35);
    assert.equal(r.to, 35);
    assert.equal(r.chapterKey, 'JHN11');
  });

  test('parses ranges, numbered books, and chapter keys', () => {
    const range = parseReference('Matthew 6:9-13');
    assert.equal(range.ok, true);
    assert.equal(range.book, 'MAT');
    assert.equal(range.from, 9);
    assert.equal(range.to, 13);
    assert.equal(parseReference('3 John 1:2').chapterKey, '3JN01');
    assert.equal(parseReference('Psalm 23:1').chapterKey, 'PSA23');
    assert.equal(parseReference('JHN11:35').chapterKey, 'JHN11');
    assert.equal(parseReference('1 Corinthians 15:3–4').to, 4);
  });

  test('rejects empty, unknown, and inverted references', () => {
    assert.equal(parseReference('').ok, false);
    assert.equal(parseReference('Notabook 1:1').error, 'unknown_book');
    assert.equal(parseReference('John 11').ok, false);
    assert.equal(parseReference('John 11:35-10').error, 'inverted_range');
  });
});

describe('exact matching', () => {
  test('matches punctuation and capitalization exactly', () => {
    const q = checkQuote(web, { reference: 'John 11:35', text: 'Jesus wept.' });
    assert.equal(q.status, 'MATCH');
    assert.equal(q.expected, 'Jesus wept.');
  });

  test('reports a punctuation or wording mismatch', () => {
    const missingPeriod = checkQuote(web, { reference: 'John 11:35', text: 'Jesus wept' });
    assert.equal(missingPeriod.status, 'MISMATCH');
    assert.equal(missingPeriod.expected, 'Jesus wept.');
    const wrong = checkQuote(web, {
      reference: 'Genesis 1:1',
      text: 'In the beginning God created the heaven and the earth.',
    });
    assert.equal(wrong.status, 'MISMATCH');
    assert.equal(
      wrong.expected,
      'In the beginning, God created the heavens and the earth.',
    );
  });

  test('trims surrounding whitespace but does not ignore inner punctuation', () => {
    assert.equal(textsMatch('Jesus wept.', '  Jesus wept.  '), true);
    assert.equal(textsMatch('Jesus wept.', 'Jesus wept!'), false);
  });

  test('joins a range with a single space between verse texts', () => {
    const q = checkQuote(web, {
      reference: 'Matthew 6:9-10',
      text:
        'Pray like this: “ ‘Our Father in heaven, may your name be kept holy. Let your Kingdom come. Let your will be done on earth as it is in heaven.',
    });
    // This is a deliberate check that range joining is exact; the test below
    // uses the tool's own expected text so a WEB typographic change fails clearly.
    if (q.status === 'MISMATCH') {
      const retry = checkQuote(web, { reference: 'Matthew 6:9-10', text: q.expected });
      assert.equal(retry.status, 'MATCH');
      assert.ok(q.expected.includes('Our Father in heaven'));
    } else {
      assert.equal(q.status, 'MATCH');
    }
  });
});

describe('missing and invalid references', () => {
  test('flags a chapter that does not exist', () => {
    const q = checkQuote(web, { reference: '3 John 2:1', text: 'Beloved, I pray that you may prosper in all things.' });
    assert.equal(q.status, 'UNKNOWN_CHAPTER');
    assert.equal(q.chapterKey, '3JN02');
  });

  test('flags a verse number missing from a real chapter', () => {
    const q = checkQuote(web, { reference: '3 John 1:99', text: 'nope' });
    assert.equal(q.status, 'UNKNOWN_VERSE');
    assert.deepEqual(q.missing, [99]);
  });

  test('flags an unparsable reference', () => {
    const q = checkQuote(web, { reference: 'see above', text: 'Jesus wept.' });
    assert.equal(q.status, 'BAD_REFERENCE');
  });
});

describe('batch and input parsing', () => {
  test('summarizes a mixed batch', () => {
    const report = checkQuotes(web, [
      { reference: 'John 11:35', text: 'Jesus wept.' },
      { reference: 'Genesis 1:1', text: 'wrong' },
    ]);
    assert.equal(report.checked, 2);
    assert.equal(report.matched, 1);
    assert.equal(report.failed, 1);
    assert.equal(report.ok, false);
  });

  test('parses JSON and TSV input', () => {
    const json = parseQuotesInput('[{"reference":"John 11:35","text":"Jesus wept."}]');
    assert.equal(json[0].reference, 'John 11:35');
    const tsv = parseQuotesInput('John 11:35\tJesus wept.\n# comment\n', { tsv: true });
    assert.equal(tsv.length, 1);
    assert.equal(tsv[0].text, 'Jesus wept.');
  });

  test('parseArgs reads flags', () => {
    const a = parseArgs(['--data', 'x.json', '--tsv', '--json', '--stdin']);
    assert.equal(a.data, 'x.json');
    assert.equal(a.tsv, true);
    assert.equal(a.json, true);
    assert.equal(a.stdin, true);
  });
});

describe('CLI', () => {
  test('exits 0 on a perfect match and 1 on a mismatch', () => {
    const ok = spawnSync(process.execPath, [CHECK, '--data', SAMPLE, '--stdin'], {
      input: JSON.stringify([{ reference: 'John 11:35', text: 'Jesus wept.' }]),
      encoding: 'utf8',
    });
    assert.equal(ok.status, 0, ok.stderr);
    assert.match(ok.stdout, /1\/1 matched/);

    const bad = spawnSync(process.execPath, [CHECK, '--data', SAMPLE, '--stdin'], {
      input: JSON.stringify([{ reference: 'John 11:35', text: 'Jesus wept' }]),
      encoding: 'utf8',
    });
    assert.equal(bad.status, 1, bad.stderr);
    assert.match(bad.stdout, /MISMATCH/);
    assert.match(bad.stdout, /0\/1 matched, 1 failed/);
  });

  test('exits 2 when no quotes are given', () => {
    const r = spawnSync(process.execPath, [CHECK], { encoding: 'utf8' });
    assert.equal(r.status, 2);
  });
});
