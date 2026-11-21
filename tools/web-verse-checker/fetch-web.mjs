#!/usr/bin/env node
/**
 * Helpers for the bundled World English Bible JSON.
 *
 * The WEB is public domain. Official source: https://ebible.org/engwebp/
 *
 * This script verifies the bundled file, or rebuilds a headings-and-verses
 * JSON from an existing file in the same chapter-key format. It will not
 * overwrite the bundle from a fresh HTML parse, so exact punctuation stays
 * stable. See data/SOURCE.md.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA = join(HERE, 'data', 'web.json');
const EXPECTED_SHA256 = '300f12ea3794b295549499815d4a6030208951e899b415b0d13ff5e5760518ca';

export const WEB_SOURCE = {
  name: 'World English Bible',
  edition: 'Protestant edition, U.S. spelling',
  page: 'https://ebible.org/engwebp/',
  rights: 'https://ebible.org/engwebp/copyright.htm',
  download: 'https://ebible.org/engwebp/engwebp_html.zip',
  archiveSha256: '83fec6cb1dad828df9b7f8c634a79f6f6bf0ee7e5a2ec233bb6036bd45006364',
  bundledSha256: EXPECTED_SHA256,
  retrievedAt: '2026-09-06',
  books: 66,
  chapters: 1189,
  verses: 31103,
};

export function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

export function compactWeb(data) {
  const compact = {};
  for (const [key, value] of Object.entries(data)) {
    compact[key] = {
      heading: value?.heading ?? '',
      verses: value?.verses ?? [],
    };
  }
  return compact;
}

export function summarize(data) {
  const keys = Object.keys(data);
  let verses = 0;
  const books = new Set();
  for (const key of keys) {
    books.add(key.slice(0, 3));
    const list = data[key]?.verses;
    if (Array.isArray(list)) verses += list.length;
  }
  return { books: books.size, chapters: keys.length, verses };
}

function usage(stream = process.stderr) {
  stream.write(`Usage:
  node fetch-web.mjs --verify [--data data/web.json]
  node fetch-web.mjs --from-json path/to/web.json [--out data/web.json]
  node fetch-web.mjs --download [--out /tmp/engwebp_html.zip]

Source: ${WEB_SOURCE.page}
Rights: ${WEB_SOURCE.rights}
`);
}

async function downloadZip(outPath) {
  process.stderr.write(`Downloading ${WEB_SOURCE.download}\n`);
  const res = await fetch(WEB_SOURCE.download);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const sha = createHash('sha256').update(buf).digest('hex');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buf);
  process.stdout.write(`Wrote ${outPath}\nSHA-256 ${sha}\nExpected archive SHA-256 ${WEB_SOURCE.archiveSha256}\n`);
  if (sha !== WEB_SOURCE.archiveSha256) {
    process.stderr.write(
      'Warning: the downloaded zip hash does not match the hash recorded at import. Not updating data/web.json.\n',
    );
    return 1;
  }
  process.stderr.write('Archive hash matches the recorded import. data/web.json was left unchanged. See data/SOURCE.md.\n');
  return 0;
}

function main(argv) {
  const args = { verify: false, download: false, fromJson: null, data: DEFAULT_DATA, out: null, help: false };
  const a = [...argv];
  while (a.length) {
    const tok = a.shift();
    if (tok === '-h' || tok === '--help') args.help = true;
    else if (tok === '--verify') args.verify = true;
    else if (tok === '--download') args.download = true;
    else if (tok === '--from-json') args.fromJson = a.shift();
    else if (tok === '--data') args.data = a.shift();
    else if (tok === '--out') args.out = a.shift();
    else {
      process.stderr.write(`Unknown option: ${tok}\n`);
      usage();
      return 2;
    }
  }
  if (args.help || (!args.verify && !args.download && !args.fromJson)) {
    usage(args.help ? process.stdout : process.stderr);
    return args.help ? 0 : 2;
  }
  if (args.verify) {
    const sha = sha256File(args.data);
    const data = JSON.parse(readFileSync(args.data, 'utf8'));
    const summary = summarize(data);
    process.stdout.write(
      `${args.data}\nSHA-256 ${sha}\nExpected ${EXPECTED_SHA256}\n${summary.books} books, ${summary.chapters} chapters, ${summary.verses} verses\n`,
    );
    if (sha !== EXPECTED_SHA256) {
      process.stderr.write('Hash mismatch.\n');
      return 1;
    }
    if (
      summary.books !== WEB_SOURCE.books ||
      summary.chapters !== WEB_SOURCE.chapters ||
      summary.verses !== WEB_SOURCE.verses
    ) {
      process.stderr.write('Counts do not match the recorded import.\n');
      return 1;
    }
    process.stdout.write('OK\n');
    return 0;
  }
  if (args.fromJson) {
    const data = JSON.parse(readFileSync(args.fromJson, 'utf8'));
    const compact = compactWeb(data);
    const out = args.out || DEFAULT_DATA;
    const text = `${JSON.stringify(compact)}\n`;
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, text);
    const sha = sha256File(out);
    const summary = summarize(compact);
    process.stdout.write(`Wrote ${out}\nSHA-256 ${sha}\n${summary.books} books, ${summary.chapters} chapters, ${summary.verses} verses\n`);
    return 0;
  }
  if (args.download) {
    const out = args.out || join(HERE, 'data', 'engwebp_html.zip');
    return downloadZip(out);
  }
  return 2;
}

const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  Promise.resolve(main(process.argv.slice(2))).then((code) => {
    process.exitCode = code;
  }, (err) => {
    process.stderr.write(`${err.message}\n`);
    process.exitCode = 2;
  });
}
