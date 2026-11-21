# WEB verse checker

A standalone, dependency-light Node.js script that checks quoted verses — a reference plus the quoted text — against a World English Bible JSON file. Matching is exact, including punctuation and capitalization.

Requires Node.js 18 or later. There are no npm package dependencies.

## Why this exists

Word & Worship quotes Scripture from the World English Bible only. If a product, a guide, or a test fixture prints a verse, the words have to be the WEB words. This tool does that check without needing the private application.

## Data format

The JSON is keyed by chapter, using a three-letter book code and a two-digit chapter number, the same shape as the app’s WEB file (`GEN01`, `JHN11`, `3JN01`):

```json
{
  "GEN01": {
    "heading": "The First Book of Moses, Commonly Called Genesis",
    "verses": [
      [1, "In the beginning, God created the heavens and the earth."],
      [2, "The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters."]
    ]
  }
}
```

A full Protestant WEB (66 books, 1,189 chapters, 31,103 verses) is bundled in `data/web.json`. Notes and footnotes from the source import are omitted; only headings and verse text are kept. See `data/SOURCE.md` for provenance, rights, and how to refresh the file.

## Usage

```bash
# JSON array of quotes
node check.mjs quotes.json

# Standard input
node check.mjs --stdin < quotes.json

# Tab-separated lines: reference, tab, text
printf '%s\n' 'John 11:35	Jesus wept.' | node check.mjs --tsv --stdin

# Machine-readable report
node check.mjs --json --data data/web.json quotes.json
```

A quotes file looks like:

```json
[
  { "reference": "John 11:35", "text": "Jesus wept." },
  { "reference": "Genesis 1:1", "text": "In the beginning, God created the heavens and the earth." }
]
```

References may be ordinary English (`John 11:35`, `3 John 1:2`, `Matthew 6:9-13`) or chapter keys (`JHN11:35`). A range is joined with a single space between verse texts.

Exit codes: `0` if every quote matches, `1` if any quote fails, `2` for usage or data errors.

The comparison trims leading and trailing whitespace on the submitted text. It does not ignore punctuation, spelling, typographic quotes, or capitalization. `Jesus wept` (no period) is a mismatch for `Jesus wept.`

## Tests

```bash
node --test test/check.test.mjs
# or
npm test
```

Tests use a small fixture (`test/fixtures/web-sample.json`) so they do not depend on loading the full Bible. The bundled `data/web.json` is the file to use for real checks.

## Refreshing the WEB file

```bash
node fetch-web.mjs --verify
node fetch-web.mjs --from-json path/to/web.json --out data/web.json
```

`fetch-web.mjs --download` records the official WEB download location. Rebuilding verse-for-verse punctuation from the upstream HTML zip is intentionally not attempted here, so that this tool stays exact against the edition already in use. See `data/SOURCE.md`.
