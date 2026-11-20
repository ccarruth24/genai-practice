# SmartPantry: Prototype Revision

**Milestone:** Project Prototype Revision (ESTM 60244), November 19, 2026
**Intended user:** a busy parent restocking everyday household staples who doesn't want to manage subscriptions
**Central task:** tell the app who lives at home, see when each staple is likely to run out, choose what to reorder, and place a (simulated) order

Contents: [1. Revisions](#1-priority-revisions) · [2. Peer feedback](#2-response-to-peer-feedback) · [3. AI role](#3-ai-role-and-implementation-status) · [4. Evaluation](#4-evaluation-of-the-revised-prototype) · [5. Before and after](#5-before-and-after-comparison) · [6. What the evidence tells us](#6-what-the-evidence-tells-us) · [7. Risk response](#7-risk-response) · [8. Limitations and priorities](#8-remaining-limitations-ranked-and-next-priorities)

---

## 1. Priority revisions

I received three reviews of the First Working Slice: two from classmates and one from the instructor. Two of the three ran into the same problem. They picked a different household, and the run-out estimates stayed exactly the same. Since predicting when a household will run out is the product's core promise, I chose three improvements that make that prediction more useful and more honest. I added one safeguard on top of them.

| # | Improvement | Why it was a priority | Where it shows up |
|---|---|---|---|
| 1 | **Household now drives the starting estimates.** A simple, visible rule scales each item by who lives at home. Every item now shows the basis for its estimate, for example "Based on 1 adult, 1 kid · standard use". Kids Body Wash is marked "May not apply" for a household with no kids. | Two of three reviewers found that household selection had no effect. Without this, the estimate is the same for every family, which undermines the central task. | Pantry item rows, "Adjust usage estimates" panel |
| 2 | **Household can be changed from the pantry, and "Other household" asks for counts.** The household chip is now a **Change** button that reopens the household choices without a reload. Estimates update immediately, with an on-screen confirmation such as "Estimates updated for 1 Adult, 1 Kid." Choosing "Other household" asks how many adults and kids live there. The app won't continue until at least one adult is entered, so it never guesses. | A reviewer had to reload the site to switch households. "Other household" previously did nothing at all. | Pantry header, start screen |
| 3 | **The order confirmation explains what the order changed.** A "What this order changed" note says the estimates stay the same because nothing is delivered. Items ordered in the session are tagged "Ordered 2 this session (simulated) · estimate unchanged". | A reviewer saw milk still "running out in four days" right after ordering two, with no explanation. | Confirmation screen, pantry rows after "Order again" |
| Risk | **"Check before you order" review step.** If the basket contains an item the estimate says the household may not need yet (more than 30 days of supply left, or an item that doesn't fit the household), the order pauses. The parent sees which items were flagged and why, then chooses **Remove them from basket** or **Order anyway**. | See [section 7](#7-risk-response). | Basket panel |

**Visual refresh (November 20).** I also replaced the original generated look with a plain, high-contrast black-and-white design. The old design had a serif headline, tiny spaced-out capital labels, a cream-and-plum palette and a decorative receipt illustration. The new one uses one sans-serif font, black buttons, gray panels and direct headings ("What do you need?", "Order placed"). Function and flow are unchanged, and all five tests were re-run on the new design with identical results.

I kept the scope small on purpose. There are still four items, no accounts, and no checkout. I made no changes to the parts reviewers said already worked: the four-tap path, the empty-basket message, and the honest simulation labels.

## 2. Response to peer feedback

Feedback is summarized without names.

| Feedback or observed issue | Decision | What changed, or why it was deferred |
|---|---|---|
| Household selection didn't change the estimates (a family of four and two adults showed identical dates). The instructor suggested a simple rule, keeping the manual controls, and then comparing two adults with a family of four. | **Acted on** | I added a per-item household rule and kept the manual "More / Less Frequent" controls. They now combine (for example, 1 adult + 1 kid with more frequent use gives milk 6 days). I ran the instructor's comparison as my before-and-after test: two adults now get milk 10 days vs. 4, pods 32 vs. 21, soap 60 vs. 30, and body wash "May not apply". |
| Household can't be changed once you're in the pantry; you have to reload the site. | **Acted on** | The household chip is now a Change button with the same choices plus a Done button. Estimates update in place and a status line confirms the change. |
| After a simulated order, "Order again" still showed milk running out in 4 days. Add a note that simulated orders don't replenish stock or update estimates. | **Adapted** | I added the suggested note to the confirmation screen. I went one step further and added a per-item "Ordered … this session (simulated) · estimate unchanged" tag in the pantry, so the explanation appears where the confusing number is. I **deferred** actually restarting the estimate after an order. Without delivery confirmation, a restarted estimate would claim stock the household may not have yet. |
| Making the household chip clickable *or* noting that household isn't used yet. | **Acted on (the stronger option)** | The household is now used, so I didn't need a "not used yet" note. Every item states its basis instead. |
| The reviews praised the speed (about four taps), the empty-basket message, and the clear simulation labels. | **Kept** | I didn't add steps to the default path. The review step only appears when the basket contains a flagged item, and a typical family of four ordering all four staples never sees it. |
| Receipt reading and run-out prediction are simulated, not live AI. | **Deferred** | Connecting a vision model is the right next step (see [section 8](#8-remaining-limitations-ranked-and-next-priorities)). For this milestone, reviewers' issues were about the *prediction experience*, which I could improve and test honestly with a transparent rule. Adding a model would have used most of the time without fixing those issues. |

## 3. AI role and implementation status

**Intended AI role:** read a receipt or order screenshot, extract the household items, and estimate when each one will run out for *this* household, so the app can suggest a reorder before the household runs out.

- **Input (intended):** receipt or order screenshot, plus household makeup and usage preferences.
- **Output (intended):** a list of items with run-out estimates and a short explanation of each estimate.
- **Value:** the parent doesn't have to track stock or remember order dates. They review a short list and tap reorder.

| Capability | Status | How it's produced now |
|---|---|---|
| Household selection, pantry, basket, quantities, simulated order, confirmation, session history | **Functional** | React state in the browser |
| Household-based run-out estimates and the "Based on…" explanation | **Functional (rule-based, not AI)** | A fixed formula in `home.tsx` (`usageRule`, `estimateDays`). Each item's demo estimate for 2 adults + 2 kids is scaled by relative daily use. Milk = adults + 1.5 × kids; body wash = kids; soap = adults + kids; pods = 1 + 0.5 × people. The "More / Less Frequent" control multiplies by 0.75 / 1.25. Results are capped at 90 days. |
| "Check before you order" safeguard | **Functional** | Flags basket items with more than 30 days of estimated supply, or items that don't apply to the household |
| Receipt / screenshot reading | **Simulated (Wizard-of-Oz)** | Both entry paths load the same four prepared items. Uploaded images are never read, uploaded, or analyzed, and the app says so. |
| AI run-out prediction from real purchase history | **Planned** | The rule stands in for it. The real model's output would replace the reference days. |
| Real ordering, delivery, persistence | **Planned / out of scope** | Nothing is purchased or saved beyond the session |

The tests below evaluate whether the **experience** and the example estimates are useful and understandable. They don't establish model accuracy, because no model is connected. The quantities in the rule are plausible demo assumptions, not measured consumption data. Because no live generative model is used, I didn't run a repeated-output variability test. The rule is deterministic, and I confirmed it gives identical results across runs.

## 4. Evaluation of the revised prototype

**Method:** I ran an automated browser script (Playwright + Chromium, desktop 1280×900) against the revised build. On November 19, 2026, I ran the same script against the original First Working Slice build for comparison. The script clicks through each case and records the text actually shown on screen. Script: [`docs/tests/run_tests.py`](docs/tests/run_tests.py). Raw output: [`docs/evidence/test-results.json`](docs/evidence/test-results.json). I re-ran all cases on November 20 after the visual refresh, and the results were identical. Screenshots: [`docs/evidence/`](docs/evidence/). I also checked the pantry at phone width (390 px) and found no horizontal scrolling ([screenshot](docs/evidence/mobile-pantry.png)). All data is synthetic demo data. Calendar dates depend on the day of the test, so only the day counts matter.

| Case | Input or action | Expected result / success criterion | Actual result | Pass, partial, or fail | Implication or next step |
|---|---|---|---|---|---|
| **Typical 1:** family of four | Default "2 Adults, 2 Kids under 10" → Use Demo Receipt Data → add all four items, milk ×2 → Place simulated order → Order again | Estimates shown with their basis. No unnecessary review step for a normal order. Confirmation shows 5 items and explains the order didn't change estimates. Pantry marks ordered items. | Milk 4 d, body wash 14 d, pods 21 d, soap 30 d, each "Based on 2 adults, 2 kids · standard use". No flags and no review step. Confirmation: 5 items plus the "What this order changed" note. After Order again, milk shows "Ordered 2 this session (simulated) · estimate unchanged" and still "Est. 4 days". History: 1 simulated. ([1](docs/evidence/typical1-confirmation.png), [2](docs/evidence/typical1-after-order-again.png)) | **Pass** | The normal path is still about four taps. Next: test with real parents whether "estimate unchanged" reads as clear or as a bug. |
| **Typical 2:** single parent switches household inside the pantry | Start as default → Change → "1 Adult, 1 Kid" → Done → add milk → set milk to More Frequent → order | No reload needed. All estimates lengthen for a smaller household, with a visible confirmation. The manual control still adjusts the estimate. The order goes through. | Chip changed to "1 Adult, 1 Kid". Status: "Estimates updated for 1 Adult, 1 Kid." Milk 4→8 d, body wash 14→28 d, pods 21→32 d, soap 30→60 d. More Frequent: milk 6 d, "Based on 1 adult, 1 kid · more frequent use". Order of 1 confirmed with no review step (milk isn't flagged). ([screenshot](docs/evidence/typical2-single-parent.png)) | **Pass** | Fixes the reload issue from peer review. |
| **Challenge:** household that isn't on the list (multigenerational, 3 adults + 3 kids) | Choose Other household → click Use Demo Receipt Data *before* entering counts → enter 3 adults, 3 kids → continue | The app asks for the missing counts instead of guessing. Estimates then shorten for a larger household. | Without counts, it showed "Add at least one adult under Other household so estimates fit your home." and stayed on the start screen. With counts, the chip read "3 Adults, 3 Kids" and estimates were milk 3 d, body wash 9 d, pods 16 d, soap 20 d. ([1](docs/evidence/challenge-other-needs-counts.png), [2](docs/evidence/challenge-multigenerational.png)) | **Pass** (behaves as designed) | The direction is sensible, but the values come from my rule, not real data. A family that buys larger sizes would get dates that are too short. Next: let parents correct an estimate directly, and use package size once receipts are read. |
| **Invalid or empty** | (a) Place order with an empty basket. (b) In the pantry, switch to Other household and leave adults at 0, then try to order. (c) Upload a PDF instead of an image. | Nothing breaks, no order is created, and each message says how to fix the problem. Estimates aren't recalculated from an impossible household. | (a) "Add at least one item to your basket first." History stayed at 0. (b) Done was disabled with "Add at least one adult…". Estimates stayed on the last valid household (4/14/21/30 d). Ordering showed "Add at least one adult to your household before ordering." (c) "Choose a PNG, JPG, or WEBP image to continue." and stayed on the start screen. ([screenshot](docs/evidence/invalid-empty.png)) | **Pass** (after fix; see note) | My first revised build showed milk as "May not apply: no kids in this household" while adults was 0, which was wrong. The automated run caught it. I changed the app to keep the last complete household until counts are valid, then re-ran the test. |
| **Risk:** buying things the household doesn't need (2 adults, no kids, adds every item) | Choose 2 Adults → add all four → Place simulated order → (i) Remove them from basket → order; (ii) separately, add only Kids Body Wash → Order anyway | The order pauses before it's placed. The parent sees which items were flagged and why, and keeps the final say. | Order paused with "Check before you order", listing Kids Body Wash (no kids, may not apply), Dishwasher Pods (est. 32 days left) and Hand Soap Refill (est. 60 days left). Milk (10 d) wasn't flagged. "Remove them" left only milk, and the order of 1 succeeded. "Order anyway" placed the body-wash order (1 item). **Before:** the original build placed all four immediately with no warning. ([after](docs/evidence/risk-review-panel.png), [before](docs/evidence/risk-before.png)) | **Pass** | The safeguard works with the household rule. Its limit: it can only be as right as the estimate (see [section 7](#7-risk-response)). |

## 5. Before-and-after comparison

**Issue (from peer review and instructor):** household selection didn't change the estimates.
**Same input, both versions:** choose household → Use Demo Receipt Data → read the four estimates. This is the comparison the instructor suggested.

| Item | Before: 2 Adults, 2 Kids | Before: 2 Adults | **After: 2 Adults, 2 Kids** | **After: 2 Adults** |
|---|---|---|---|---|
| Whole Milk | 4 days | 4 days | 4 days | **10 days** |
| Kids Body Wash | 14 days | 14 days | 14 days | **May not apply: no kids in this household** |
| Dishwasher Pods | 21 days | 21 days | 21 days | **32 days** |
| Hand Soap Refill | 30 days | 30 days | 30 days | **60 days** |
| Change household from pantry? | No (reload) | No (reload) | Yes | Yes |

Screenshots: [before, family](docs/evidence/before-family-of-four.png) · [before, 2 adults](docs/evidence/before-two-adults.png) · [after, family](docs/evidence/after-family-of-four.png) · [after, 2 adults](docs/evidence/after-two-adults.png)

**Did it help?** Yes, for the issue reviewers raised. The estimates now respond to household in the expected direction, and each one states its basis, so a parent can tell why two homes see different dates. The reference family is unchanged by design. It didn't make the numbers *accurate*: they come from my rule, not observed use. A second before-and-after for the risk case is in the Risk row above. Before, the order was placed immediately. After, it pauses for review.

## 6. What the evidence tells us

The central flow works reliably now. A parent can set or change their household, see estimates that respond to it with a plain reason, and place an order in about four taps. Missing or impossible inputs produce clear messages instead of guesses. What remains untested is the thing that matters most for the product's value: whether real parents find these estimates believable and useful. All five tests were scripted by me. The numbers come from a rule I wrote, and receipt reading is still simulated, so these results support the *usability* of the prediction experience but not the claim that SmartPantry can predict a real household's run-out dates. The test process also caught a real bug (a misleading "no kids" label when adults was 0), which shows that edge cases need checking every time the estimate logic changes. Next I would (1) have three or four parents run the central task on their phones and say whether the estimate for their own household feels right, and (2) connect real receipt extraction so estimates start from what a family actually bought.

## 7. Risk response

**Risk: the estimate nudges a parent into buying things they don't need, and the people most affected are households that don't match the "typical family" the defaults were built around.** In the first version every household got estimates built for two adults and two kids. A couple without children was shown Kids Body Wash on a 14-day clock, and the flow made it one tap to reorder. A parent who trusts the app (the over-reliance theme from class) could spend money on duplicates or items they don't use. Single-parent, multigenerational and child-free households would be most affected, which is a **fairness** problem: the product works best for the household it was designed around.

**What I changed:**
- Estimates now come from the actual household, and "Other household" asks for real counts instead of defaulting to the typical family.
- Every estimate shows its basis, and items that don't fit the household are labeled "May not apply" with an "Add anyway" button.
- Before an order is placed, any flagged item triggers **Check before you order**, which lists the items and reasons and offers **Remove them** or **Order anyway**.

The parent stays in control and is never blocked. This is more than a disclaimer, because the flow itself stops at the decision point.

**Test result:** in the Risk case, the original build ordered all four items for a two-adult home immediately. The revised build paused and flagged the three items it expected weren't needed yet. "Remove" and "Order anyway" both worked.

**What risk remains:**
- The safeguard is only as good as the estimate. My rule is a demo assumption, so it can flag something a family really needs (they buy for a babysitter or a grandchild) or miss something they don't.
- The 30-day threshold is a guess.
- A determined user can click "Order anyway" every time, so the step reduces over-buying but doesn't prevent it.
- When the AI is real, it needs testing across household types to check it isn't systematically worse for some of them.
- The safeguard itself is implemented, not simulated, but it runs on simulated inputs.

## 8. Remaining limitations (ranked) and next priorities

Ranked by effect on the central task:

1. **Receipt reading is still simulated.** Every path loads the same four items, so the product's main AI promise is untested. *(Largest effect: the pantry doesn't reflect what a family bought.)*
2. **Estimates are rule-based demo values.** They respond to household and usage, but they don't account for package size, brand or real purchase dates, and they haven't been checked against real households.
3. **No testing with real parents yet.** All evaluation was scripted by the builder, so I don't know if "estimate unchanged" or the review step reads clearly to a first-time user.
4. **Estimates don't restart after an order.** This is a deliberate choice for now because nothing is delivered. Nothing persists beyond the session.

**Next priorities (for the final project):**
1. Connect a vision model to read a sample receipt into items with package sizes (key stored in Replit Secrets), with a clear message when an image isn't a receipt. Then test real extraction on 5+ sample receipts, including repeat runs to check for variation.
2. Run the central task with three or four parents on their phones, ask whether their household's estimates feel right, and record where they hesitate.
3. Let parents correct an estimate directly ("I still have plenty" / "Running low") and remember the correction for the session, so a wrong estimate is easy to fix.
