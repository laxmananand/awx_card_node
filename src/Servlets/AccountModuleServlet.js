import express from "express";
import * as AccountsModule from "../Controllers/AccountsModuleController.js";

const router = express.Router();

// Accounts Module

router.get("/exchangerate", AccountsModule.getExchangeRate);

router.get("/createAccount", AccountsModule.createAccount);

router.get("/bankName", AccountsModule.bankNames);

router.get("/transactionHistory", AccountsModule.getTransactionHistory);

router.get("/fetchBalance", AccountsModule.getCurrenciesList);

router.get("/fetchAccountDetails", AccountsModule.getActivatedBankAccount);

router.get("/amountConversion", AccountsModule.amountConversion);

router.get("/getVaDetails", AccountsModule.getVirtualAccount);

export default router;