import express from "express";
import * as functions from "../Controllers/PaymentController.js";

const router = express.Router();

router.post("/addBeneficeries/:customerHashId", functions.addBeneficiry);
router.get("/listBeneficiries/:customerHashId", functions.listBeneficiries);
router.get("/fetchBeneficiryDetails/:beneficiaryHashId/:customerHashId", functions.fetchDetails);
router.post("/deleteBeneficiry/:beneficiaryHashId/:customerHashId", functions.deleteBeneficiary);
//router.get("/listCountry", functions.listCountry);
router.get("/listCurrency/:customerHashId", functions.listCurrency);
router.post("/sendMoney/:customerHashId", functions.sendMoney);
router.get("/fetchSupportedCorridors", functions.fetchCorridors);
router.post("/fetchexcahngerate/:customerHashId", functions.fetchexcahngerate);

router.get("/fetchSupportedCorridorsfullrespone",functions.fetchCorridorsfullresponse)

router.post("/validationschema/:customerHashId", functions.validationschema);
router.get("/listpurposeCode", functions.listpurposeCode);

router.post("/fetchBankName", functions.fetchBankName);
router.post("/fetchpaymentstatus/:customerHashId", functions.fetchpaymentstatus);
router.post("/editBeneficiary/:customerHashId/:beneficiaryHashId", functions.editBeneficiary);
router.post("/fetchBeneficiaryValidationSchema/:customerHashId", functions.fetchBeneficiaryValidationSchema);
router.get("/listCountrycurrency", functions.listCountrycurrency);

//Business Txn Tag
router.get("/businessTag", functions.businessTxnTag);

//Business Txn Tag
router.post("/uploadReciept", functions.uploadTxnReciept);

//Business Txn Tag
router.get("/downloadReceipt", functions.downloadTxnReceipt);

router.get("/enquireRemittanceQuote", functions.EnquireRemittanceQuote);

router.post("/addBeneficeriesAWX", functions.addBeneficiaryawx);
router.post("/listBeneficeriesAWX",functions.listBeneficiaries_awx);
router.post("/sendMoney_AWX",functions.sendMoney_AWX)


export default router;
