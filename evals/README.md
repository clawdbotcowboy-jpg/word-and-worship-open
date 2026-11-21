# Public sample of the Philip test set

`philip-public-sample.json` holds 18 cases drawn from the product’s Philip evaluation suite. They are here so readers can see the kinds of checks we run: verse fidelity, the truth about the resurrection, refusals to invent Scripture, respect and scope limits, and a prompt-injection refusal.

This is a sample, not the full set. It is not a complete safety argument by itself.

## What was left out

- Crisis and urgent self-harm cases, including the 988 care path
- Personal care cases (grief, abuse, loneliness, and similar)
- Cases that use a reader’s private notes, journal, or memory
- Internal runners, unpublished harness instructions, and unpublished fixtures

Omitted cases still exist in the private suite and still have to pass before relevant features ship.

## How to read a case

Each case has an `input` (what the reader asks) and a `rubric` (what a good answer must do). Some cases also list strings that must or must not appear. When an answer quotes Scripture, the quoted text must match the World English Bible exactly. You can check that with `tools/web-verse-checker/`.

These cases do not grant access to the private application, and they are not an invitation to send application pull requests.
