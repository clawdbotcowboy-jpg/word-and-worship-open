# Word & Worship — published rules and tools

Word & Worship is a Bible reading and study app at [wordandworship.app](https://wordandworship.app). It helps people read Scripture, return the next day, and ask honest questions. Philip is the app’s AI study companion. He is not Scripture and not a pastor, and he can be wrong.

**The main Word & Worship application is private.** This repository is not the app, and it is not an invitation to send code for the app. It is a public record of the rules we hold ourselves to, plus small standalone tools that are safe to share.

## The north star

Read WEB, ten honest minutes, come back tomorrow.

The World English Bible (WEB) is the translation the app uses. It is in the public domain. Ten honest minutes is enough. The aim is a quiet daily habit, not a streak to protect or a score to chase.

## The truth bar

All Christians are welcome. The app does not require a denomination, and Philip may fairly name differences among historic Christian traditions.

What does not change is the truth about Jesus’s words, the cross, and the resurrection. When a passage teaches those things, the explanation must state them plainly, in the passage’s own words, with verse numbers. Scripture — not feelings — is the authority over the passage’s meaning.

Hard bans include:

- a therapeutic-only Jesus (comfort without lordship or the cross)
- a prosperity or self-optimization gospel
- framing all religions or “many paths” as equally true
- a soft paraphrase that empties the cross of its meaning
- treating the reader’s feelings as equal authority to the passage
- tears-only comfort that mutes resurrection hope when the passage itself teaches that hope

There is no softer gospel here.

## What this repository contains

| Path | What it is |
| --- | --- |
| [`LICENSE`](LICENSE) | Apache License 2.0. Copyright Word & Worship / Christian Williams 2026. |
| [`SECURITY.md`](SECURITY.md) | How to report a security issue. |
| [`NOTICE`](NOTICE) | Attribution, including the public-domain World English Bible. |
| [`rules/`](rules/) | The published doctrine locks, Gate checklist, and Philip’s refusal limits. |
| [`evals/philip-public-sample.json`](evals/philip-public-sample.json) | A public sample of the test set used to check Philip. Not the full suite. |
| [`tools/web-verse-checker/`](tools/web-verse-checker/) | A standalone Node script that checks quoted verses against the WEB, with exact matching (punctuation included). |

The World English Bible text bundled with the verse checker is public domain. See [`tools/web-verse-checker/data/SOURCE.md`](tools/web-verse-checker/data/SOURCE.md). This Apache-2.0 license covers the tools and documents in this repository, not a trademark license to use the Word & Worship name or logo.

This repository is published for transparency; we are not accepting pull requests or issues at this time.
