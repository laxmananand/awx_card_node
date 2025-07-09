// Common Routes
import express from "express";

import * as functions from "../Controllers/StripeController.js";

//Node Part of Subscription by Abhinav
const router = express.Router();


router.post("/get-all-invoices", functions.getAllInvoices);
router.put("/change-plan", functions.changePlan);
router.get("/cancel-plan", functions.cancelSubscription);
router.get("/get-payment-method", functions.getPaymentMethods);
router.post("/remove-payment-method", functions.removePaymentMethod);
router.post("/add-payment-method", functions.addPaymentMethod);
router.post("/set-default-payment-method", functions.setDefaultPaymentMethod);
router.get("/get-subscription-details", functions.getSubscriptionDetailsV2);
router.post("/create-session", functions.createCheckoutSessionV2);
router.post("/prevent-cancelation", functions.preventSubscriptionCancellation);

export default router;
