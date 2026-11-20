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
- **Visual design:** I asked Claude to restyle the app because the original design looked obviously AI-generated. I chose the direction (a plain, black-and-white, Uber-like style), and Claude rewrote the stylesheet and simplified headings and labels. I reviewed screenshots before publishing.
- **Writing:** Claude drafted the revision documentation and this disclosure from the reviews, the test output, and the prior README. I reviewed and edited them before submitting.

## Representative prompts

1. **To Replit Agent (after the first build):** *"make it sleek looking and UX/UI extremely friendly. it should be super easy to use with no friction"* **Result:** the agent reworked the flow so "Use Demo Receipt Data" goes straight to the four items in one tap, made screenshot upload optional, and turned alerts off by default so a phone number didn't block the demo. The one-tap path stayed in this revision.
2. **To Replit Agent:** *"i also dont want restock reminders, i want them to be able to reorder more in the app"* **Result:** the first build (made from my pasted brief) included phone-number setup and a simulated SMS restock alert. This prompt removed that direction and replaced it with the in-app basket and simulated reorder that the product is built around now.
3. **To Claude (this revision):** *"Using these 3 tabs, along with peer reviews and feedback my professor gave, do the project prototype revision."* **Result:** a plan with three priority fixes plus one safeguard, tied to specific reviewer comments, then the code, tests and documents in this repository. I checked the plan against the reviews and the rubric before accepting it.

## Human judgment

- **Reversed:** the SMS restock-alert feature from the first build (prompt 2). After seeing it working, I decided reminders and texts would make SmartPantry feel like another subscription to manage, so I had the agent replace them with reordering directly in the app.
- **Deferred instead of building:** connecting a live vision model this week. Reviewers' problems were with the prediction experience (household ignored, confusing post-order dates), not with receipt reading, so I kept receipt reading as a clearly labeled simulation and fixed what reviewers actually hit.
- **Adapted, not copied:** a reviewer suggested only a note that orders don't update estimates. I kept the note, added a per-item "estimate unchanged" tag where the confusing number appears, and decided *not* to make orders restart estimates, because nothing is delivered.
- **Kept the default path short:** the safeguard only appears when a flagged item is in the basket, so the four-tap path reviewers praised is unchanged for a typical order.
- **Changed the AI's design:** I rejected the original generated visual style (serif headline, tiny capital labels, cream-and-plum palette) and directed a simpler high-contrast look.
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
