// Common Routes
import express from "express";

import * as functions from "../Controllers/ExpenseController.js";

//List Country Code

const router = express.Router();

router.get("/listbills", functions.listbills);
router.get("/listinvoices", functions.listinvoices);
router.get("/docanalysis", functions.docanalysis);
router.get("/createbill", functions.Createbill);
router.post("/uploadtos3", functions.Uploadtos3);
router.get("/createinvoice", functions.Createinvoice);
router.post("/createinvoicedoc", functions.Createinvoicedoc);
router.get("/listcustomers", functions.listcustomer);
router.get("/createcustomer", functions.Createcustomer);
router.get("/fetchAccountDetails", functions.getActivatedBankAccount);
router.get("/fetchbalances", functions.fetchbalance);
router.get("/listcards", functions.listcards);
router.get("/getcardnumber", functions.getcardnumber);
router.get("/getcvvandexpiry", functions.getcvv);
router.get("/getcardlimitdata", functions.getcardlimit);
router.get("/setpincard", functions.Setpin);
router.get("/addcard", functions.Addcard);
router.get("/setCardlimit", functions.setCardlimit);
router.post("/sendInvoice", functions.sendInvoice);
router.post("/updatebills", functions.updatebills);
router.post("/temporaryBlock", functions.temporaryBlockcards);
router.post("/addVirtualCard", functions.addVirtualCard);
router.get("/createphysicalCard", functions.CreatePhysicalCard);
router.post("/temporaryUnBlock", functions.temporaryUnBlockcards);
router.post("/activeCard", functions.activeCard);
router.post("/permanentBlock", functions.permanentBlockcards);


// routers for awx

router.get("/listcardsAWX", functions.listCards_AWX);
router.get("/getsensitavecarddata_awx",functions.getcardsensitavedata_awx);
router.get("/getcarddata_awx",functions.getcarddata_awx);
router.post("/createCard_awx",functions.addVirtualCard_awx);
router.post("/updateCard_awx/:card_id",functions.updateCard_awx);

router.post("/card-token",functions.fetchCardToken);


export default router;
