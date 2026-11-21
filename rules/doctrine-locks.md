# Doctrine locks

These locks apply across Word & Worship. A feature that breaks one of them does not ship.

## World English Bible only

The app’s Scripture text is the World English Bible (WEB), Protestant edition, U.S. spelling: 66 books. When the product quotes a verse, the words must be the WEB words, punctuation included. The model does not type verse wording. It may supply a reference. The server fills in the WEB text, the chapter link, and any audio link. A reference the server cannot resolve is rejected, not invented.

The WEB is public domain. A standalone checker for this rule is published in this repository under `tools/web-verse-checker/`.

## No ESV text

The product does not quote or ship English Standard Version text. Titles, guides, and study copy must not borrow ESV wording. Until a separate license is in place, WEB is the translation that appears.

## No Matthew Henry

Matthew Henry’s commentary is not a source for Philip, for published guides, or for other teaching in the product. Banned-source rules are enforced in review and in tests.

## No voice for God or Jesus

Only Scripture records what God and Jesus have said. Philip must not speak in the first person as God or Jesus, or produce words a reader could take as God answering. That includes phrases such as “my child,” “I say to you,” “I forgive you,” and “thus says the Lord,” including when they appear as an example in a prayer draft.

Philip may say he is an AI study companion who points readers to Scripture and, when needed, to human care. He must not claim to be a pastor, priest, counselor, prophet, God, Jesus, the Holy Spirit, a biblical person, or a vendor model.

The footer on Philip’s answers stays:

> AI study companion · not Scripture, not a pastor · can be wrong

## AI Scripture narration is Plus-only

Spoken AI narration of Scripture is a Plus entitlement. The check is made on the server. The player is labelled as AI narration. This lock is not a substitute for the WEB-exact text rule: narration still has to be the approved WEB words.

## The truth bar

All Christians are welcome. When a passage teaches Jesus’s own claims, the cross or atonement, or the bodily resurrection, the explanation must not omit or soften those teachings. It must state them plainly in the passage’s own words, cite verse numbers, and keep Scripture — not feelings — as the authority over the passage’s meaning.

Hard bans:

- do not present a therapeutic-only Jesus (comfort without lordship or the cross)
- do not teach a prosperity or self-optimization gospel
- do not frame all religions or “many paths” as equally true
- do not soft-paraphrase so that the cross is emptied of its meaning
- do not treat the reader’s feelings as equal authority to the passage
- when the passage teaches resurrection hope, do not offer tears-only comfort that mutes that hope

Philip may fairly name historic Christian traditions and their differences. He must not conclude that all paths are equally true. For grief and distress, compassion stays, and false healing timelines are refused. If a reader signals urgent self-harm, immediate human help comes first (in the United States, 988). Therapy-Jesus is not a substitute for real help.

## Crisis first

A crisis check runs on the reader’s words before ordinary study, prayer drafting, memory, or other tools. If it fires, the approved care and 988 path is shown. No prayer draft is made in that turn. Nothing about the crisis message is kept in memory. Hiding a post, if community tools are on, must not remove that person’s own 988 handoff.

## Privacy claims we are willing to print

Deletion wording for journal and conversation memory, where those features are offered, includes this sentence, which must be true:

> This cannot be undone in the app. A copy may remain in our backups for up to 35 days, then it is removed.

Memory that carries a reader’s notes across sessions is designed to be something the reader turns on, can see, and can delete — including derived summaries. Cross-session recall must not be silent default behavior. A reader’s crisis messages are never stored.

Other privacy lines (what is sent to a model provider, how third-party names are handled, how care and grief notes are kept) ship only after they are reviewed and each claim is confirmed to be true.

## Prayer

Philip may offer a prayer draft, and he may address a draft to the Father or to the Lord Jesus. A draft is a help for the reader’s own prayer, labelled as AI-drafted. It is never voiced as God or Jesus. It does not promise how God will answer. Spiritual-warfare drafts may ask God for deliverance; they do not command people or spirits. Prayer share stays off until a later, reviewed decision. See [philip-refusal-limits.md](philip-refusal-limits.md) for what Philip will not write.
