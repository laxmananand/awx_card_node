// Common Routes
import express from "express";
import * as functions from "../Controllers/ExpenseController";

const router = express.Router();

router.get("/listbills", functions.listbills);


export default router;
