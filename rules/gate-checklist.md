# Scripture & Doctrine Gate checklist

The Scripture & Doctrine Gate reviews teaching, Scripture display, Philip’s speech, prayer, memory, and other doctrine-bearing work before it can merge or be switched on. A pass is given on a specific version of the work. Switching a feature on in production needs its own pass and the owner’s go. Feature switches stay off until then. “On” means the value is exactly on, not a look-alike.

This is the public checklist. It is not a substitute for the full internal review, and it does not list unpublished work.

## Before review

Submit the actual copy, the actual behavior, and the tests that lock it. Do not ask the Gate to approve a paraphrase of a rule and a different string in the product.

Include, as they apply:

1. Every fixed string the reader will see: labels, empty and error states, disclaimers, footers, refusal exemplars, and care copy.
2. How Scripture is supplied: the model may send a reference only; the server fills WEB text. Show that invented or altered verse text is rejected.
3. The doctrine locks in [doctrine-locks.md](doctrine-locks.md), including WEB only, no ESV text, no Matthew Henry, no God or Jesus voice, and Plus-only narration where narration is involved.
4. Crisis-first behavior: the 988 handoff is never delayed or dropped; a crisis turn does not take the ordinary draft or memory path.
5. The truth bar: Jesus’s words, the cross, and the resurrection are stated plainly when the passage teaches them; the hard bans are tested.
6. Eval cases for the change, including cases that must fail if a lock is broken. A public sample of the wider Philip test set is in `evals/`.
7. Privacy wording that will be shown to readers, with a confirmation that each claim is true (including the 35-day backup sentence where deletion is offered).
8. How to turn the feature off, and proof that off matches the product without the feature.

## Pass criteria that apply to Philip’s surfaces

- The doctrine-line footer renders under every Philip answer.
- Unknown or invalid widgets, fields, or references are dropped. Dropped means a plain-text fallback, not a retry loop on a sensitive turn.
- The model cannot fill free text into a widget unless that field has been approved by name.
- No model-generated HTML, raw URLs, or code on a core teaching surface. Addresses the product needs are built by the server from an allow-list.
- Entitlements are checked on the server (for example, AI narration is Plus-only).
- Actions that change a reader’s data ask for confirmation and run only after the reader confirms.
- Human-support copy is fixed and approved, not model-written, and cannot be stripped by a validator.
- Rejection logs used for debugging do not store the reader’s question or the model’s text.
- A new kind of widget or a new teaching surface needs its own pass and ships switched off.

## Verse cards and quotations

Every Scripture quotation shown as Scripture must match the WEB source exactly. Zero rendered verses whose text differs from the WEB source. The public verse checker in this repository is the same kind of check: reference plus text, exact match, punctuation included.

If a reader asks for a verse that does not exist, Philip says so and does not invent text.

## Eval harness

Cases are graded against written rubrics and against exact-text checks where a string is locked. A case that is only a placeholder does not count as a pass. Crisis cases exist in the private suite; they are not published in the public sample. Shipping a feature that touches Philip requires the relevant cases to have run, not merely to have been filed.

## After a pass

- Merge or switch-on is still a separate step. A pass is not automatic publication.
- If the work changes after the pass, it returns for review at the new version.
- If a later edit changes a pinned, approved file — even metadata — it returns to the Gate.
- Public pages that make doctrine claims, including a Trust page, go through Scripture review, and the doctrine claims go to the Gate.
