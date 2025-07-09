import express from "express";

import * as functions from "../Controllers/XeroController.js";

const router = express.Router();

router.post("/xero-connection", functions.xeroConnection);

router.post("/xero-connection-code", functions.xeroConnectionCode);

router.post("/xero-connection-tenantId", functions.xeroConnectionTenantId);

router.post("/createcustomer", functions.xeroCreateCustomer);

router.post("/createcustomer", functions.xeroCreateCustomer);

router.post("/createInvoice", functions.xeroCreateInvoice);

router.post("/getCustomer", functions.xeroGetCustomer);

router.post("/xeroCreateCustomerEnd", functions.xeroCreateCustomerEnd);

router.post("/createInvoiceBill", functions.xeroCreateInvoiceBill);

router.post("/uploadInvoiceBill", functions.xeroUploadInvoiceBill);

router.post("/getPDF", functions.getPDF);


export default router;
