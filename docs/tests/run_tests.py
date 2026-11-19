"""Runs the SmartPantry revision test cases against the original (8001) and revised (8002) builds.
Records what actually appears on screen and saves screenshots as evidence."""
import json, os, sys
from playwright.sync_api import sync_playwright

BEFORE = "http://localhost:8001/"
AFTER = "http://localhost:8002/"
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)
results = {}

def runouts(page):
    ids = ["kids-body-wash", "dishwasher-pods", "whole-milk", "hand-soap-refill"]
    return {i: page.get_by_test_id(f"text-runout-{i}").inner_text().strip() for i in ids}

def text(page, tid):
    loc = page.get_by_test_id(tid)
    return loc.inner_text().strip() if loc.count() else None

with sync_playwright() as p:
    browser = p.chromium.launch()
    def new(url, mobile=False):
        ctx = browser.new_context(viewport={"width": 390, "height": 844} if mobile else {"width": 1280, "height": 900})
        pg = ctx.new_page()
        pg.goto(url); pg.wait_for_load_state("networkidle")
        return pg

    # ---- Before/after: same input (2 Adults vs default family) ----
    for label, url in [("before", BEFORE), ("after", AFTER)]:
        pg = new(url)
        pg.get_by_test_id("button-use-demo-receipt").click()
        family = runouts(pg)
        pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/{label}-family-of-four.png", full_page=True)
        pg = new(url)
        pg.get_by_test_id("button-household-2-adults").click()
        pg.get_by_test_id("button-use-demo-receipt").click()
        two = runouts(pg)
        pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/{label}-two-adults.png", full_page=True)
        results[f"compare_{label}"] = {"2A2K": family, "2A": two,
            "household_editable_in_pantry": pg.get_by_test_id("button-change-household").count() > 0}

    # ---- Typical 1: family of four, add all four, order ----
    pg = new(AFTER)
    pg.get_by_test_id("button-use-demo-receipt").click()
    for i in ["kids-body-wash", "dishwasher-pods", "whole-milk", "hand-soap-refill"]:
        pg.get_by_test_id(f"button-add-{i}").click()
    pg.get_by_test_id("button-increase-whole-milk").click()
    flags = {i: text(pg, f"text-flag-{i}") for i in ["kids-body-wash", "dishwasher-pods", "whole-milk", "hand-soap-refill"]}
    pg.get_by_test_id("button-place-order").click()
    review_shown = pg.get_by_test_id("panel-review").count() > 0
    conf = text(pg, "text-confirmed-count")
    effect = text(pg, "text-order-effect")
    pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/typical1-confirmation.png", full_page=True)
    pg.get_by_test_id("button-order-again").click()
    ordered_tag = text(pg, "text-ordered-whole-milk")
    milk_after = text(pg, "text-runout-whole-milk")
    pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/typical1-after-order-again.png", full_page=True)
    results["typical1"] = dict(runouts_basis=text(pg, "text-basis-whole-milk"), flags=flags, review_shown=review_shown,
                               confirmed_count=conf, effect_note=effect, ordered_tag=ordered_tag, milk_after=milk_after,
                               history=text(pg, "text-order-count"))

    # ---- Typical 2: single parent changes household inside pantry ----
    pg = new(AFTER)
    pg.get_by_test_id("button-use-demo-receipt").click()
    start = runouts(pg)
    pg.get_by_test_id("button-change-household").click()
    pg.get_by_test_id("button-household-1-adult-1-kid").click()
    notice = text(pg, "text-household-notice")
    pg.get_by_test_id("button-household-done").click()
    changed = runouts(pg)
    chip = text(pg, "text-household")
    pg.get_by_test_id("button-add-whole-milk").click()
    pg.get_by_test_id("button-toggle-cadence").click()
    pg.get_by_test_id("button-frequency-whole-milk-more").click()
    milk_more = text(pg, "text-runout-whole-milk")
    basis_more = text(pg, "text-basis-whole-milk")
    pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/typical2-single-parent.png", full_page=True)
    pg.get_by_test_id("button-place-order").click()
    results["typical2"] = dict(start=start, after_change=changed, notice=notice, chip=chip, milk_more=milk_more,
                               basis_more=basis_more, review_shown=pg.get_by_test_id("panel-review").count() > 0,
                               confirmed=text(pg, "text-confirmed-count"))

    # ---- Challenge: Other household, multigenerational 3 adults 3 kids ----
    pg = new(AFTER)
    pg.get_by_test_id("button-household-other-household").click()
    pg.get_by_test_id("button-use-demo-receipt").click()
    err0 = text(pg, "text-household-error")
    pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/challenge-other-needs-counts.png", full_page=True)
    for _ in range(3): pg.get_by_test_id("button-adults-increase").click()
    for _ in range(3): pg.get_by_test_id("button-kids-increase").click()
    pg.get_by_test_id("button-use-demo-receipt").click()
    results["challenge"] = dict(error_before_counts=err0, chip=text(pg, "text-household"), runouts=runouts(pg),
                                basis=text(pg, "text-basis-whole-milk"))
    pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/challenge-multigenerational.png", full_page=True)

    # ---- Invalid/empty: empty basket + Other household with zero adults in pantry + non-image upload ----
    pg = new(AFTER)
    pg.get_by_test_id("button-use-demo-receipt").click()
    pg.get_by_test_id("button-place-order").click()
    empty_err = text(pg, "text-basket-error")
    hist = text(pg, "text-order-count")
    pg.get_by_test_id("button-change-household").click()
    pg.get_by_test_id("button-household-other-household").click()
    done_disabled = pg.get_by_test_id("button-household-done").is_disabled()
    zero_adult_runouts = runouts(pg)
    pg.get_by_test_id("button-add-whole-milk").click()
    pg.get_by_test_id("button-place-order").click()
    zero_adult_err = text(pg, "text-basket-error")
    pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/invalid-empty.png", full_page=True)
    pg2 = new(AFTER)
    pg2.get_by_test_id("input-receipt").set_input_files(files=[{"name": "notes.pdf", "mimeType": "application/pdf", "buffer": b"%PDF-1.4"}])
    results["invalid"] = dict(empty_basket_error=empty_err, history=hist, done_disabled_zero_adults=done_disabled, zero_adult_runouts=zero_adult_runouts,
                              zero_adult_order_error=zero_adult_err, pdf_upload_error=text(pg2, "text-upload-error"),
                              still_on_start=pg2.get_by_test_id("button-use-demo-receipt").count() > 0)

    # ---- Risk: 2 adults (no kids) add everything; safeguard should pause ----
    for label, url in [("before", BEFORE), ("after", AFTER)]:
        pg = new(url)
        pg.get_by_test_id("button-household-2-adults").click()
        pg.get_by_test_id("button-use-demo-receipt").click()
        for i in ["kids-body-wash", "dishwasher-pods", "whole-milk", "hand-soap-refill"]:
            pg.get_by_test_id(f"button-add-{i}").click()
        pg.get_by_test_id("button-place-order").click()
        r = {"order_placed_immediately": pg.get_by_test_id("card-order-confirmation").count() > 0}
        if label == "after":
            r["review_items"] = [pg.get_by_test_id(f"review-item-{i}").inner_text() for i in ["kids-body-wash", "dishwasher-pods", "whole-milk", "hand-soap-refill"] if pg.get_by_test_id(f"review-item-{i}").count()]
            pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/risk-review-panel.png", full_page=True)
            pg.get_by_test_id("button-remove-flagged").click()
            r["basket_after_remove"] = text(pg, "text-basket-count")
            r["basket_lines"] = [l for l in ["kids-body-wash", "dishwasher-pods", "whole-milk", "hand-soap-refill"] if pg.get_by_test_id(f"basket-item-{l}").count()]
            pg.get_by_test_id("button-place-order").click()
            r["order_after_remove"] = text(pg, "text-confirmed-count")
            # Order-anyway path keeps user control
            pg = new(url)
            pg.get_by_test_id("button-household-2-adults").click()
            pg.get_by_test_id("button-use-demo-receipt").click()
            pg.get_by_test_id("button-add-kids-body-wash").click()
            pg.get_by_test_id("button-place-order").click()
            pg.get_by_test_id("button-order-anyway").click()
            r["order_anyway_count"] = text(pg, "text-confirmed-count")
        else:
            pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/risk-before.png", full_page=True)
        results[f"risk_{label}"] = r

    # Mobile smoke check of the revised flow
    pg = new(AFTER, mobile=True)
    pg.get_by_test_id("button-use-demo-receipt").click()
    pg.get_by_test_id("button-change-household").click()
    pg.wait_for_timeout(1000); pg.screenshot(path=f"{OUT}/mobile-pantry.png", full_page=True)
    results["mobile_horizontal_overflow"] = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth")
    browser.close()

print(json.dumps(results, indent=1))
