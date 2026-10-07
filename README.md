# SmartPantry

SmartPantry turns a household receipt into a quick, calm reorder flow so parents can restock everyday essentials without managing subscriptions.

## What the first working slice does

A parent picks their household type, loads a demo receipt (or chooses a screenshot), and sees four household staples (kids body wash, dishwasher pods, whole milk, hand soap refill) with estimated run-out dates. They add the items they want to a basket, adjust quantities, and place a simulated order. A completion screen summarizes the order and it appears in a session-only order history. Nothing is purchased and there are no accounts.

## Try it

Open the prototype: https://smart-pantry-replenishment.replit.app

Quickest path: leave the default household selected, click **Use Demo Receipt Data**, click **Add** on the items, then **Place simulated order**.

## AI: working vs. simulated

**Intended AI role:** read a receipt or order screenshot, extract the household items, and estimate when each will run out so the product can prompt a reorder before the household runs out.

**Working now:** the household selection, the pantry screen, adding and removing items, quantity controls, the basket total, the simulated order and its completion screen, a session-only order history, and on-screen messages for an empty basket and for uploaded images.

**Simulated:** receipt reading and run-out estimates. Both the demo-receipt button and the screenshot upload open the same four prewritten items, and the run-out dates are demo data, not calculated from a receipt or live stock levels. Uploaded images stay on the device and are not read, uploaded, or analyzed, and the app now says so on the pantry screen. No AI model or API is connected, no order is placed, and nothing is saved beyond the current session.

No API keys, passwords, or tokens are in this repository.

## Test results

Tests were run in desktop Chrome against the published prototype on October 7, 2026. The first round of testing found two gaps (the challenge and empty-basket cases below). Both were fixed in the prototype and the two tests were re-run; the results below are from the fixed version.

| Test | Input or action | What happened | Pass, partial, or fail |
| --- | --- | --- | --- |
| Typical case | Default household (2 Adults, 2 Kids under 10); clicked Use Demo Receipt Data; added all four items; clicked Place simulated order | The pantry screen listed four staples with estimated run-out dates (Whole Milk 4 days / Oct 11, Kids Body Wash 14 days / Oct 21, Dishwasher Pods 21 days / Oct 28, Hand Soap Refill 30 days / Nov 6) and a note that the dates come from demo data, not a scanned receipt. The basket started empty ("Nothing in your basket yet"). After adding all four, it showed each at quantity 1 with a total of 4. Placing the order opened a completion screen ("That's taken care of. For the demo.") with the order summary, a note that nothing was purchased, an Order again button, and "Order history: 1 simulated" with a timestamp. Re-run after the fixes with the same result. No dead ends. | Pass |
| Challenge case | Uploaded an image that is not a receipt (a screenshot of the app's own start screen) | The app accepted the file and opened the same four demo items. The pantry screen now says "This demo doesn't read uploaded images. These are sample items, not what's in your image." and the source label reads "Source: demo sample data (uploaded file not read)." Before the fix, the label showed the file name and nothing said the image was not read, which could suggest it had been analyzed. | Pass (after fix; first run was Partial) |
| Invalid or empty case | With an empty basket, clicked Place simulated order | No order was created, the user stayed on the pantry screen, order history stayed at 0, and the message "Add at least one item to your basket first." appeared under the button. No error or crash. Before the fix, the click did nothing and gave no explanation. | Pass (after fix) |

## Known limitations

1. **Receipt reading is simulated.** Every input, including an image that isn't a receipt, leads to the same four demo items. The app now says uploads are not read, but it cannot tell a real receipt from any other image. Next step: add real receipt extraction with an AI model (keeping the key in a secret) and show a clear message when an image can't be read as a receipt.
2. **Run-out dates are hard-coded demo estimates.** They aren't calculated from the receipt or household, so they can't adapt to what a family actually bought. Next step: calculate estimates from item type, size, and household and let users correct them.
3. **Nothing is saved or really ordered, and only desktop was tested.** Orders and history last only for the session, and mobile layout was not tested. All testing so far was done by the builder, not by other people. Next step: have a few real parents try it on their phones and record where they get confused.
