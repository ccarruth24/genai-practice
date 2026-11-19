# SmartPantry

SmartPantry turns a household receipt into a quick, calm reorder flow, so parents can restock everyday essentials without managing subscriptions.

**Intended user:** a busy parent restocking household staples (milk, dish pods, soap, kids' body wash) who doesn't want to track stock or juggle subscriptions.

## Quick links

| Component | Link |
|---|---|
| **Running prototype** | https://smart-pantry-replenishment.replit.app |
| **Replit project** | https://replit.com/@ccarruth/SmartPantry-Replenishment |
| **Demo Video** (Google Drive) | [See Demo Video below](#demo-video) |
| **Revision documentation** (priority improvements, peer feedback response, five test cases, before/after, interpretation, risk response, limitations, priorities) | [revision.md](revision.md) |
| **Draft AI-use disclosure** | [ai-use-disclosure.md](ai-use-disclosure.md) |
| **Test evidence** (screenshots and raw results) | [docs/evidence/](docs/evidence/) · [test-results.json](docs/evidence/test-results.json) · [test script](docs/tests/run_tests.py) |
| **Prototype code** | [artifacts/smart-pantry/src/pages/home.tsx](artifacts/smart-pantry/src/pages/home.tsx) (main app) · [artifacts/smart-pantry/](artifacts/smart-pantry/) |
| Demo script | [docs/demo-script.md](docs/demo-script.md) |

## Demo Video

**Draft demo (Google Drive):** _link to be added after upload_. Viewing access is granted to Emelia Hughes (ehughes8@nd.edu) and Samuel Huang (ghuang3@nd.edu). The same file is uploaded to Canvas.

## Try it

Open https://smart-pantry-replenishment.replit.app in any browser. You don't need an account. Nothing is purchased or saved beyond the session.

1. Choose your household (or **Other household** and enter adults and kids), then click **Use Demo Receipt Data**.
2. Each staple shows an estimated run-out date and what it's based on. Use **Change** on the household chip to switch households. The estimates update immediately.
3. Click **Add** on what you need, adjust quantities, then **Place simulated order**.
4. If the basket includes something your household may not need yet, **Check before you order** lets you remove it or order anyway.

**To run the code locally:** `pnpm install`, then `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/smart-pantry run dev`.

## What changed in this revision

Based on three reviews (two peers and the instructor) and my own tests:

1. **Household now drives the run-out estimates**, using a simple visible rule, and each item shows its basis. Previously, every household saw identical dates.
2. **Household can be changed inside the pantry** without reloading, and "Other household" asks for real counts instead of guessing.
3. **The confirmation explains what a simulated order changes.** Ordered items are tagged "estimate unchanged".
4. **Risk safeguard: "Check before you order"** pauses an order that includes items the household likely doesn't need yet, and leaves the final choice to the parent.

Full details, the feedback table, tests and before-and-after are in [revision.md](revision.md).

## AI: functional, simulated, planned

**Intended AI role:** read a receipt or order screenshot, extract the household items, and estimate when each will run out for this household, so the product can prompt a reorder before the household runs out.

| | Status |
|---|---|
| Household selection, pantry, basket, quantities, simulated order, confirmation, session history, review safeguard | **Functional** |
| Run-out estimates and their explanation | **Functional, rule-based (not AI):** demo reference values scaled by household and usage (see revision.md §3) |
| Receipt / screenshot reading | **Simulated (Wizard-of-Oz):** both paths load the same four prepared items. Uploaded images stay on the device and are never read, uploaded, or analyzed. |
| AI extraction and prediction, real ordering, saved history | **Planned** |

No AI model or API is connected. No API keys, passwords, tokens, or real user data are in this repository.

## Known limitations

1. Receipt reading is simulated, so the pantry doesn't yet reflect what a family actually bought.
2. Estimates come from a demo rule. They respond to household and usage but haven't been checked against real households and ignore package size.
3. Testing so far was scripted by the builder; it hasn't been run with real parents yet.
4. Simulated orders don't restart estimates, and nothing persists beyond the session.

## Previous milestone: First Working Slice tests (October 7, 2026)

| Test | Result |
|---|---|
| Typical: default household, add all four, place order | Pass |
| Challenge: upload a non-receipt image | Pass after fix (the app now says uploads aren't read) |
| Empty basket: place order with nothing added | Pass after fix (clear message) |

These are expanded to five cases in [revision.md](revision.md#4-evaluation-of-the-revised-prototype).
