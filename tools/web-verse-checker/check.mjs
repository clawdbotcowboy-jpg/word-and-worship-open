#!/usr/bin/env node
/**
 * Standalone World English Bible verse checker.
 *
 * Compares quoted verses (a reference plus the quoted text) against a WEB
 * JSON file. Matching is exact, including punctuation and capitalization.
 * The WEB text is public domain. See data/SOURCE.md.
 *
 * Usage:
 *   node check.mjs [--data path/to/web.json] quotes.json
 *   node check.mjs [--data path/to/web.json] --stdin < quotes.json
 *   printf '%s\n' 'John 11:35	Jesus wept.' | node check.mjs --tsv --stdin
 *
 * Quotes JSON: an array of { "reference": "John 11:35", "text": "Jesus wept." }
 * or a single object. TSV/lines: reference, then a tab, then the text.
 *
 * Exit 0 if every quote matches. Exit 1 if any mismatch, missing verse, or
 * unparsable reference. Exit 2 for usage or data errors.
 */
import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA = join(HERE, 'data', 'web.json');

/** Canonical WEB book codes used as the first three characters of chapter keys (GEN01, JHN11). */
export const BOOK_CODES = {
  GEN: 'Genesis',
  EXO: 'Exodus',
  LEV: 'Leviticus',
  NUM: 'Numbers',
  DEU: 'Deuteronomy',
  JOS: 'Joshua',
  JDG: 'Judges',
  RUT: 'Ruth',
  '1SA': '1 Samuel',
  '2SA': '2 Samuel',
  '1KI': '1 Kings',
  '2KI': '2 Kings',
  '1CH': '1 Chronicles',
  '2CH': '2 Chronicles',
  EZR: 'Ezra',
  NEH: 'Nehemiah',
  EST: 'Esther',
  JOB: 'Job',
  PSA: 'Psalm',
  PRO: 'Proverbs',
  ECC: 'Ecclesiastes',
  SNG: 'Song of Solomon',
  ISA: 'Isaiah',
  JER: 'Jeremiah',
  LAM: 'Lamentations',
  EZK: 'Ezekiel',
  DAN: 'Daniel',
  HOS: 'Hosea',
  JOL: 'Joel',
  AMO: 'Amos',
  OBA: 'Obadiah',
  JON: 'Jonah',
  MIC: 'Micah',
  NAM: 'Nahum',
  HAB: 'Habakkuk',
  ZEP: 'Zephaniah',
  HAG: 'Haggai',
  ZEC: 'Zechariah',
  MAL: 'Malachi',
  MAT: 'Matthew',
  MRK: 'Mark',
  LUK: 'Luke',
  JHN: 'John',
  ACT: 'Acts',
  ROM: 'Romans',
  '1CO': '1 Corinthians',
  '2CO': '2 Corinthians',
  GAL: 'Galatians',
  EPH: 'Ephesians',
  PHP: 'Philippians',
  COL: 'Colossians',
  '1TH': '1 Thessalonians',
  '2TH': '2 Thessalonians',
  '1TI': '1 Timothy',
  '2TI': '2 Timothy',
  TIT: 'Titus',
  PHM: 'Philemon',
  HEB: 'Hebrews',
  JAS: 'James',
  '1PE': '1 Peter',
  '2PE': '2 Peter',
  '1JN': '1 John',
  '2JN': '2 John',
  '3JN': '3 John',
  JUD: 'Jude',
  REV: 'Revelation',
};

const ALIASES = new Map();

function addAlias(code, ...names) {
  for (const name of names) {
    ALIASES.set(normalizeBookName(name), code);
  }
}

function normalizeBookName(name) {
  return String(name)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

addAlias('GEN', 'Genesis', 'Gen', 'Ge', 'Gn');
addAlias('EXO', 'Exodus', 'Exod', 'Exo', 'Ex');
addAlias('LEV', 'Leviticus', 'Lev', 'Le', 'Lv');
addAlias('NUM', 'Numbers', 'Num', 'Nu', 'Nm', 'Nb');
addAlias('DEU', 'Deuteronomy', 'Deut', 'Deu', 'Dt');
addAlias('JOS', 'Joshua', 'Josh', 'Jos', 'Jsh');
addAlias('JDG', 'Judges', 'Judg', 'Jdg', 'Jg');
addAlias('RUT', 'Ruth', 'Rth', 'Ru');
addAlias('1SA', '1 Samuel', '1 Sam', '1 Sa', '1 Sm', 'I Samuel', 'First Samuel', '1Samuel', 'I Sam');
addAlias('2SA', '2 Samuel', '2 Sam', '2 Sa', '2 Sm', 'II Samuel', 'Second Samuel', '2Samuel', 'II Sam');
addAlias('1KI', '1 Kings', '1 Kgs', '1 Ki', '1 K', 'I Kings', 'First Kings', '1Kings', 'I Kgs');
addAlias('2KI', '2 Kings', '2 Kgs', '2 Ki', '2 K', 'II Kings', 'Second Kings', '2Kings', 'II Kgs');
addAlias('1CH', '1 Chronicles', '1 Chron', '1 Chr', '1 Ch', 'I Chronicles', 'First Chronicles', '1Chronicles');
addAlias('2CH', '2 Chronicles', '2 Chron', '2 Chr', '2 Ch', 'II Chronicles', 'Second Chronicles', '2Chronicles');
addAlias('EZR', 'Ezra', 'Ezr');
addAlias('NEH', 'Nehemiah', 'Neh');
addAlias('EST', 'Esther', 'Est', 'Esth');
addAlias('JOB', 'Job', 'Jb');
addAlias('PSA', 'Psalm', 'Psalms', 'Ps', 'Psa', 'Psm', 'Pss');
addAlias('PRO', 'Proverbs', 'Prov', 'Pro', 'Pr', 'Prv');
addAlias('ECC', 'Ecclesiastes', 'Eccles', 'Eccl', 'Ecc', 'Qoheleth', 'Qoh');
addAlias('SNG', 'Song of Solomon', 'Song of Songs', 'Song of Solomon', 'Canticles', 'Canticle of Canticles', 'Song', 'So', 'Sos', 'Cant');
addAlias('ISA', 'Isaiah', 'Isa', 'Is');
addAlias('JER', 'Jeremiah', 'Jer', 'Je', 'Jr');
addAlias('LAM', 'Lamentations', 'Lam', 'La');
addAlias('EZK', 'Ezekiel', 'Ezek', 'Eze', 'Ezk');
addAlias('DAN', 'Daniel', 'Dan', 'Da', 'Dn');
addAlias('HOS', 'Hosea', 'Hos', 'Ho');
addAlias('JOL', 'Joel', 'Joe', 'Jl', 'Jol');
addAlias('AMO', 'Amos', 'Am');
addAlias('OBA', 'Obadiah', 'Obad', 'Ob');
addAlias('JON', 'Jonah', 'Jnh', 'Jon');
addAlias('MIC', 'Micah', 'Mic', 'Mc');
addAlias('NAM', 'Nahum', 'Nah', 'Na', 'Nam');
addAlias('HAB', 'Habakkuk', 'Hab', 'Hb');
addAlias('ZEP', 'Zephaniah', 'Zeph', 'Zep', 'Zp');
addAlias('HAG', 'Haggai', 'Hag', 'Hg');
addAlias('ZEC', 'Zechariah', 'Zech', 'Zec', 'Zc');
addAlias('MAL', 'Malachi', 'Mal', 'Ml');
addAlias('MAT', 'Matthew', 'Matt', 'Mat', 'Mt');
addAlias('MRK', 'Mark', 'Mrk', 'Mk', 'Mr');
addAlias('LUK', 'Luke', 'Luk', 'Lk');
addAlias('JHN', 'John', 'Jhn', 'Jn', 'Joh');
addAlias('ACT', 'Acts', 'Act', 'Ac');
addAlias('ROM', 'Romans', 'Rom', 'Ro', 'Rm');
addAlias('1CO', '1 Corinthians', '1 Cor', '1 Co', 'I Corinthians', 'First Corinthians', '1Corinthians', 'I Cor');
addAlias('2CO', '2 Corinthians', '2 Cor', '2 Co', 'II Corinthians', 'Second Corinthians', '2Corinthians', 'II Cor');
addAlias('GAL', 'Galatians', 'Gal', 'Ga');
addAlias('EPH', 'Ephesians', 'Eph');
addAlias('PHP', 'Philippians', 'Phil', 'Php', 'Pp');
addAlias('COL', 'Colossians', 'Col');
addAlias('1TH', '1 Thessalonians', '1 Thess', '1 Thes', '1 Th', 'I Thessalonians', 'First Thessalonians', '1Thessalonians');
addAlias('2TH', '2 Thessalonians', '2 Thess', '2 Thes', '2 Th', 'II Thessalonians', 'Second Thessalonians', '2Thessalonians');
addAlias('1TI', '1 Timothy', '1 Tim', '1 Ti', 'I Timothy', 'First Timothy', '1Timothy');
addAlias('2TI', '2 Timothy', '2 Tim', '2 Ti', 'II Timothy', 'Second Timothy', '2Timothy');
addAlias('TIT', 'Titus', 'Tit', 'Ti');
addAlias('PHM', 'Philemon', 'Phlm', 'Phm', 'Philem');
addAlias('HEB', 'Hebrews', 'Heb');
addAlias('JAS', 'James', 'Jas', 'Jm');
addAlias('1PE', '1 Peter', '1 Pet', '1 Pe', '1 Pt', 'I Peter', 'First Peter', '1Peter');
addAlias('2PE', '2 Peter', '2 Pet', '2 Pe', '2 Pt', 'II Peter', 'Second Peter', '2Peter');
addAlias('1JN', '1 John', '1 Jn', '1 Jo', '1 Jhn', 'I John', 'First John', '1John');
addAlias('2JN', '2 John', '2 Jn', '2 Jo', '2 Jhn', 'II John', 'Second John', '2John');
addAlias('3JN', '3 John', '3 Jn', '3 Jo', '3 Jhn', 'III John', 'Third John', '3John');
addAlias('JUD', 'Jude', 'Jud', 'Jd');
addAlias('REV', 'Revelation', 'Rev', 'Re', 'The Revelation', 'Revelation of John', 'Apocalypse');

// Also accept the three-letter chapter key itself.
for (const code of Object.keys(BOOK_CODES)) {
  addAlias(code, code);
}

/**
 * Parse a Scripture reference into book code, chapter, and verse range.
 * Accepts "John 11:35", "John 11:35-37", "3 John 1:2", "Psalm 23:1",
 * and chapter keys such as "JHN11:35".
 */
export function parseReference(raw) {
  const input = String(raw ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (!input) return { ok: false, error: 'empty_reference', input: raw };

  // Chapter-key form: JHN11:35 or JHN11 35
  const keyForm = input.match(/^([1-3]?[A-Za-z]{2,3})(\d{1,3})[:\s]+(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?$/);
  if (keyForm && ALIASES.has(normalizeBookName(keyForm[1]))) {
    const book = ALIASES.get(normalizeBookName(keyForm[1]));
    const chapter = Number(keyForm[2]);
    const from = Number(keyForm[3]);
    const to = keyForm[4] ? Number(keyForm[4]) : from;
    return finishParse(input, book, chapter, from, to);
  }

  const m = input.match(
    /^((?:(?:1|2|3|I|II|III|First|Second|Third)\s+)?[A-Za-z][A-Za-z ]*?)\s+(\d{1,3})\s*:\s*(\d{1,3})(?:\s*[-–—]\s*(\d{1,3}))?$/i,
  );
  if (!m) return { ok: false, error: 'unparsable_reference', input };

  const book = ALIASES.get(normalizeBookName(m[1]));
  if (!book) return { ok: false, error: 'unknown_book', input, book: m[1] };
  const chapter = Number(m[2]);
  const from = Number(m[3]);
  const to = m[4] ? Number(m[4]) : from;
  return finishParse(input, book, chapter, from, to);
}

function finishParse(input, book, chapter, from, to) {
  if (!Number.isInteger(chapter) || chapter < 1) {
    return { ok: false, error: 'invalid_chapter', input, book, chapter };
  }
  if (!Number.isInteger(from) || from < 1 || !Number.isInteger(to) || to < 1) {
    return { ok: false, error: 'invalid_verse', input, book, chapter, from, to };
  }
  if (to < from) return { ok: false, error: 'inverted_range', input, book, chapter, from, to };
  const chapterKey = `${book}${String(chapter).padStart(2, '0')}`;
  return { ok: true, input, book, chapter, from, to, chapterKey };
}

/** Load a WEB JSON object or file path in the GEN01 / verses:[[n,text],...] shape. */
export function loadWeb(source) {
  let data = source;
  if (typeof source === 'string') {
    const path = isAbsolute(source) ? source : join(process.cwd(), source);
    data = JSON.parse(readFileSync(path, 'utf8'));
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('WEB data must be a JSON object keyed by chapter (for example GEN01)');
  }
  const index = new Map();
  for (const [key, chapter] of Object.entries(data)) {
    const verses = new Map();
    const list = chapter?.verses;
    if (!Array.isArray(list)) continue;
    for (const row of list) {
      if (!Array.isArray(row) || row.length < 2) continue;
      const n = Number(row[0]);
      const text = row[1];
      if (Number.isInteger(n) && typeof text === 'string') verses.set(n, text);
    }
    index.set(key, { heading: chapter.heading ?? '', verses });
  }
  return { data, index };
}

function lookupVerses(web, parsed) {
  const chapter = web.index.get(parsed.chapterKey);
  if (!chapter) {
    return { ok: false, status: 'UNKNOWN_CHAPTER', parsed };
  }
  const parts = [];
  const missing = [];
  for (let n = parsed.from; n <= parsed.to; n += 1) {
    if (!chapter.verses.has(n)) missing.push(n);
    else parts.push({ verse: n, text: chapter.verses.get(n) });
  }
  if (missing.length) {
    return { ok: false, status: 'UNKNOWN_VERSE', parsed, missing, chapterKey: parsed.chapterKey };
  }
  return {
    ok: true,
    parsed,
    chapterKey: parsed.chapterKey,
    expected: parts.map((p) => p.text).join(' '),
    verses: parts,
  };
}

/** Exact comparison. Leading and trailing whitespace on the submitted text is trimmed; punctuation is not ignored. */
export function textsMatch(expected, submitted) {
  const left = String(expected ?? '');
  const right = String(submitted ?? '').replace(/^\s+|\s+$/g, '');
  return left === right;
}

export function checkQuote(web, quote) {
  const reference = quote?.reference ?? quote?.ref ?? '';
  const text = quote?.text ?? quote?.quote ?? '';
  const id = quote?.id;
  const parsed = parseReference(reference);
  if (!parsed.ok) {
    return {
      status: 'BAD_REFERENCE',
      id,
      reference,
      text,
      error: parsed.error,
      detail: parsed,
    };
  }
  const found = lookupVerses(web, parsed);
  if (!found.ok) {
    return {
      status: found.status,
      id,
      reference,
      text,
      chapterKey: parsed.chapterKey,
      book: parsed.book,
      chapter: parsed.chapter,
      from: parsed.from,
      to: parsed.to,
      missing: found.missing,
    };
  }
  const match = textsMatch(found.expected, text);
  return {
    status: match ? 'MATCH' : 'MISMATCH',
    id,
    reference,
    text: String(text ?? '').replace(/^\s+|\s+$/g, ''),
    expected: found.expected,
    chapterKey: parsed.chapterKey,
    book: parsed.book,
    chapter: parsed.chapter,
    from: parsed.from,
    to: parsed.to,
  };
}

export function checkQuotes(web, quotes) {
  const results = quotes.map((q) => checkQuote(web, q));
  const mismatches = results.filter((r) => r.status !== 'MATCH');
  return {
    checked: results.length,
    matched: results.length - mismatches.length,
    failed: mismatches.length,
    ok: mismatches.length === 0 && results.length > 0,
    results,
  };
}

export function parseQuotesInput(raw, { tsv = false } = {}) {
  const text = String(raw ?? '').replace(/^\uFEFF/, '');
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (!tsv && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
    const data = JSON.parse(trimmed);
    const list = Array.isArray(data) ? data : data.quotes ?? data.cases ?? [data];
    return list.map((row, i) => {
      if (typeof row === 'string') throw new Error(`Quote ${i} is a string; expected {reference, text}`);
      return row;
    });
  }
  return trimmed.split(/\r?\n/).flatMap((line, i) => {
    if (!line.trim() || line.trim().startsWith('#')) return [];
    const tab = line.indexOf('\t');
    if (tab === -1) throw new Error(`Line ${i + 1} is not tab-separated (reference<TAB>text)`);
    return [{ reference: line.slice(0, tab).trim(), text: line.slice(tab + 1) }];
  });
}

function formatReport(report) {
  const lines = [];
  for (const r of report.results) {
    if (r.status === 'MATCH') {
      lines.push(`MATCH  ${r.reference}`);
      continue;
    }
    if (r.status === 'MISMATCH') {
      lines.push(`MISMATCH  ${r.reference}`);
      lines.push(`  submitted: ${JSON.stringify(r.text)}`);
      lines.push(`  expected:  ${JSON.stringify(r.expected)}`);
      continue;
    }
    if (r.status === 'UNKNOWN_CHAPTER' || r.status === 'UNKNOWN_VERSE') {
      const miss = r.missing ? ` (missing verse ${r.missing.join(', ')})` : '';
      lines.push(`${r.status}  ${r.reference}${miss}`);
      continue;
    }
    lines.push(`${r.status}  ${r.reference || '(empty)'}  (${r.error || 'unparsable'})`);
  }
  lines.push('');
  lines.push(`${report.matched}/${report.checked} matched, ${report.failed} failed`);
  return lines.join('\n');
}

function printUsage(stream = process.stderr) {
  stream.write(`Usage: node check.mjs [--data path/to/web.json] [--tsv] [--json] [--stdin] [quotes-file]

Check quoted verses against a World English Bible JSON file.
Matching is exact, including punctuation.

Quotes file: JSON array of { "reference", "text" }, or TSV lines with --tsv.
`);
}

export function parseArgs(argv) {
  const args = { data: DEFAULT_DATA, files: [], stdin: false, tsv: false, json: false, help: false };
  const a = [...argv];
  while (a.length) {
    const tok = a.shift();
    if (tok === '-h' || tok === '--help') args.help = true;
    else if (tok === '--stdin') args.stdin = true;
    else if (tok === '--tsv') args.tsv = true;
    else if (tok === '--json') args.json = true;
    else if (tok === '--data') {
      if (!a.length) throw new Error('--data requires a path');
      args.data = a.shift();
    } else if (tok.startsWith('--data=')) args.data = tok.slice('--data='.length);
    else if (tok.startsWith('-')) throw new Error(`Unknown option: ${tok}`);
    else args.files.push(tok);
  }
  return args;
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    printUsage();
    return 2;
  }
  if (args.help) {
    printUsage(process.stdout);
    return 0;
  }
  if (!args.stdin && args.files.length === 0) {
    printUsage();
    return 2;
  }
  let web;
  try {
    web = loadWeb(args.data);
  } catch (err) {
    process.stderr.write(`Failed to load WEB data from ${args.data}: ${err.message}\n`);
    return 2;
  }
  let raw;
  try {
    raw = args.stdin ? readFileSync(0, 'utf8') : readFileSync(args.files[0], 'utf8');
  } catch (err) {
    process.stderr.write(`Failed to read quotes: ${err.message}\n`);
    return 2;
  }
  let quotes;
  try {
    quotes = parseQuotesInput(raw, { tsv: args.tsv });
  } catch (err) {
    process.stderr.write(`Failed to parse quotes: ${err.message}\n`);
    return 2;
  }
  if (quotes.length === 0) {
    process.stderr.write('No quotes to check.\n');
    return 2;
  }
  const report = checkQuotes(web, quotes);
  if (args.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(`${formatReport(report)}\n`);
  return report.ok ? 0 : 1;
}

const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  process.exitCode = main(process.argv.slice(2));
}
