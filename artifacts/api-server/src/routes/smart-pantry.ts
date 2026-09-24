import { Router, type IRouter } from "express";
import {
  TriggerPantryTestAlertBody,
  TriggerPantryTestAlertResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/smart-pantry/test-alert", (req, res): void => {
  const parsed = TriggerPantryTestAlertBody.safeParse(req.body);

  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid test alert request");
    res.status(400).json({ error: "Unable to prepare the test alert." });
    return;
  }

  req.log.info("Generating simulated SmartPantry alert");

  const alert = TriggerPantryTestAlertResponse.parse({
    message:
      "SmartPantry: Your Kids Body Wash will run out in 3 days. Reply YES to auto-order via Amazon.",
    deliveryMode: "simulated",
  });

  res.json(alert);
});

export default router;