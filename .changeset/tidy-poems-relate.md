---
"@timonwa/firebase-hooks": patch
---

Document every hook option in the published types. Each `Use<Name>OptionsProps` field now carries TSDoc, with its default where it has one, so editors show what an option does at the call site instead of only its type.

Also exposes `./package.json` as a subpath export, so tooling can read the version without reaching into the package directory.

No runtime change — every hook behaves exactly as before.
