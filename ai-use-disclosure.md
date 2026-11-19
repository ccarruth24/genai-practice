# AI-Use Disclosure (draft): SmartPantry

Milestone: Project Prototype Revision, November 19, 2026. This builds on the AI-use record started in Problem Framing.

## Tools used

| Tool | Where it was used |
|---|---|
| **Replit Agent** (inside Replit) | Generated the original SmartPantry app and workspace (React + Vite frontend, the Express health-check server, and project scaffolding) from my product description, and published it to `smart-pantry-replenishment.replit.app`. |
| **Claude (Anthropic), through Claude in Chrome** | For this revision: read the assignment, rubric, and the three reviews from Canvas. Proposed which feedback to act on. Wrote the code changes in `artifacts/smart-pantry/src/pages/home.tsx`. Wrote and ran the browser test script. Drafted `revision.md`, this disclosure, the README updates, and the demo script. Also used earlier in the term to help draft my peer reviews of classmates' projects. |

No AI tool had access to real user data. All data in the app and tests is synthetic. No API keys are in the repository.

## Development assistance

- **Code:** Replit Agent built the first working slice. For the revision, Claude implemented the household-based estimate rule, the in-pantry household editor, the "Other household" count inputs, the post-order explanation, and the "Check before you order" safeguard.
- **Debugging:** an automated test run found that, with "Other household" set to 0 adults, every item read "May not apply: no kids in this household". The fix keeps the last complete household until valid counts are entered, and the test was re-run to confirm it.
- **Testing:** Claude wrote `docs/tests/run_tests.py` (Playwright). It runs the five cases against both the original and revised builds and saves screenshots and the on-screen text it found.
- **Writing:** Claude drafted the revision documentation and this disclosure from the reviews, the test output, and the prior README. I reviewed and edited them before submitting.

## Representative prompts

1. **To Replit Agent (building the slice):** *"Keep SmartPantry sleek, exceptionally easy to use, and low-friction: make the demo path one tap, keep optional choices secondary, and prioritize touch-friendly mobile interactions."* **Result:** a one-tap "Use Demo Receipt Data" path and a collapsed, optional "Adjust usage estimates" panel. Both stayed in the revision.
2. **To Replit Agent:** *"Do not add restock reminders or SMS setup; reordering more items should happen directly in the app."* **Result:** I removed the reminder/SMS direction, and the product stayed focused on in-app reordering.
3. **To Claude (this revision):** *"Using these 3 tabs, along with peer reviews and feedback my professor gave, do the project prototype revision."* **Result:** a plan with three priority fixes plus one safeguard, tied to specific reviewer comments, then the code, tests and documents in this repository. I checked the plan against the reviews and the rubric before accepting it.

## Human judgment

- **Rejected:** the earlier reminder/SMS direction (prompt 2). Reminders and texts would pull the product toward the subscription-management feeling it's meant to replace, and reordering should happen where the parent already is: in the app.
- **Deferred instead of building:** connecting a live vision model this week. Reviewers' problems were with the prediction experience (household ignored, confusing post-order dates), not with receipt reading, so I kept receipt reading as a clearly labeled simulation and fixed what reviewers actually hit.
- **Adapted, not copied:** a reviewer suggested only a note that orders don't update estimates. I kept the note, added a per-item "estimate unchanged" tag where the confusing number appears, and decided *not* to make orders restart estimates, because nothing is delivered.
- **Kept the default path short:** the safeguard only appears when a flagged item is in the basket, so the four-tap path reviewers praised is unchanged for a typical order.
- **Corrected:** the misleading "no kids" label for a 0-adult household (see Debugging). I didn't accept the first version of the estimate logic as-is.

## Verification

- Ran all five test cases plus the before-and-after against both builds in Chromium, and compared the recorded on-screen text with the expected results ([`docs/evidence/test-results.json`](docs/evidence/test-results.json)).
- Opened the screenshots to confirm layout, including at phone width (390 px, no horizontal scrolling).
- Ran the TypeScript type check and a production build with no errors in the changed file.
- Hand-checked the rule's arithmetic for each household (for example, milk for 2 adults: 4 days × 5 ÷ 2 = 10 days).
- **Still needs checking:** the household rule's numbers against real consumption, testing with actual parents on their own phones, accessibility with a screen reader, and, once added, live model output.

## AI inside the product

| | |
|---|---|
| **Task** | Read a receipt or order screenshot, extract household items, and estimate when each will run out for this household |
| **Inputs** | Receipt or screenshot image, household makeup (adults and kids), usage preference |
| **Outputs** | Item list with run-out estimates and a short reason for each |
| **Current status** | **Simulated.** Receipt reading is Wizard-of-Oz: both entry paths load four prepared items, and uploads are never read. Run-out estimates come from a transparent rule, not AI. No model or API is connected. |
