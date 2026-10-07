# SmartPantry

SmartPantry turns a household receipt into a quick, calm reorder flow so parents can restock everyday essentials without managing subscriptions.

## What the first working slice does

A parent picks their household type, loads a demo receipt (or chooses a screenshot), and sees four household staples (kids body wash, dishwasher pods, whole milk, hand soap refill) with estimated run-out dates. They add the items they want to a basket, adjust quantities, and place a simulated order. A completion screen summarizes the order and it appears in a session-only order history. Nothing is purchased and there are no accounts.

## Try it

Open the prototype: https://smart-pantry-replenishment.replit.app

Quickest path: leave the default household selected, click **Use Demo Receipt Data**, click **Add** on the items, then **Place simulated order**.

## AI: working vs. simulated

**Intended AI role:** read a receipt or order screenshot, extract the household items, and estimate when each will run out so the product can prompt a reorder before the household runs out.

**Working now:** the household selection, the pantry screen, adding and removing items, quantity controls, the basket total, the simulated order and its completion screen, and a session-only order history.

**Simulated:** receipt reading and run-out estimates. Both the demo-receipt button and the screenshot upload open the same four prewritten items, and the run-out dates are demo data, not calculated from a receipt or live stock levels. Uploaded images stay on the device and are not read, uploaded, or analyzed. No AI model or API is connected, no order is placed, and nothing is saved beyond the current session.

No API keys, passwords, or tokens are in this repository.

## Test results

Tests were run in desktop Chrome against the published prototype on October 7, 2026.

| Test | Input or action | What happened | Pass, partial, or fail |
| --- | --- | --- | --- |
| Typical case | Default household (2 Adults, 2 Kids under 10); clicked Use Demo Receipt Data; added all four items; clicked Place simulated order | The pantry screen listed four staples with estimated run-out dates (Whole Milk 4 days / Oct 11, Kids Body Wash 14 days / Oct 21, Dishwasher Pods 21 days / Oct 28, Hand Soap Refill 30 days / Nov 6) and a note that the dates come from demo data, not a scanned receipt. The basket started empty ("Nothing in your basket yet"). After adding all four, it showed each at quantity 1 with a total of 4. Placing the order opened a completion screen ("That's taken care of. For the demo.") with the order summary, a note that nothing was purchased, an Order again button, and "Order history: 1 simulated" with a timestamp. No dead ends. | Pass |
| Challenge case | Uploaded an image that is not a receipt (a screenshot of the app's own start screen) | The app accepted it and opened the same four demo items, with the source label showing the file name ("Source: not-a-receipt.png"). The pantry screen's note says the dates are demo data, but nothing there says the image was not read or that it didn't look like a receipt. The start screen does say images are not read, but a user could still think the upload was analyzed. | Partial |
| Invalid or empty case | With an empty basket, clicked Place simulated order | Nothing happened: the user stayed on the pantry screen, no order was created, and order history stayed at 0. The button looks dimmed and the basket says "Tap Add beside anything you'd like to reorder," but no message explains why the click did nothing. No error or crash. | Pass (minor gap: no explanatory message) |

## Known limitations

1. **Receipt reading is simulated.** Every input, including an image that isn't a receipt, leads to the same four demo items, and the "Source" label shows the uploaded file name, which can suggest the image was read. Next step: add real receipt extraction with an AI model (keeping the key in a secret) and show a clear message when an image can't be read.
2. 2. **Run-out dates are hard-coded demo estimates.** They aren't calculated from the receipt or household, so they can't adapt to what a family actually bought. Next step: calculate estimates from item type, size, and household and let users correct them.
   3. 3. **Nothing is saved or really ordered, and only desktop was tested.** Orders and history last only for the session, and mobile layout was not tested. Next step: have a few real parents try it on their phones and record where they get confused.
      4. 
