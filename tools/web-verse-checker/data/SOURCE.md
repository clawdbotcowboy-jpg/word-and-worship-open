# World English Bible data

The file `web.json` in this folder is the World English Bible, Protestant edition, U.S. spelling. The WEB is in the public domain.

## Official source

- Edition page: <https://ebible.org/engwebp/>
- Rights: <https://ebible.org/engwebp/copyright.htm>
- Download used for the original import: <https://ebible.org/engwebp/engwebp_html.zip>

eBible’s rights page asks that the text be preserved when the name “World English Bible” is used. This file is verse text and chapter headings only. Translation footnotes from the import were not copied into this bundle.

## This copy

The chapter-key format (`GEN01`, `JHN11`, and so on) and the `verses` arrays of `[verseNumber, text]` follow the import used by Word & Worship. The import was retrieved on 6 September 2026.

| Field | Value |
| --- | --- |
| Books / chapters / verses | 66 / 1,189 / 31,103 |
| Upstream archive SHA-256 (engwebp_html.zip, as recorded at import) | `83fec6cb1dad828df9b7f8c634a79f6f6bf0ee7e5a2ec233bb6036bd45006364` |
| SHA-256 of this bundled `web.json` (headings and verses, no footnotes) | `300f12ea3794b295549499815d4a6030208951e899b415b0d13ff5e5760518ca` |

Verify the bundle:

```bash
node ../fetch-web.mjs --verify
```

The import normalized whitespace, dropped HTML, kept verse words, and checked each source chapter for contiguous verse numbers. That is why this file, rather than a fresh parse of the zip, is the exact-match reference for the checker.

## Refreshing

To rebuild this file from a WEB JSON object in the same chapter-key format:

```bash
node ../fetch-web.mjs --from-json path/to/web.json --out web.json
```

`node ../fetch-web.mjs --download` prints the official zip URL and can save the zip for your own records. It does not silently replace `web.json`, because a new parse could change punctuation and break exact matches.
