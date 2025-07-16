// Common Routes
import express from "express";
import * as functions from "../Controllers/AWXController.js";
import multer from "multer";

// Define the storage for uploaded files (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/generateAuthToken", functions.generateAuthToken);
router.post("/createAccountAWX", functions.createAccountAWX);
router.post("/authorizeAccountAWX", functions.authorizeAccountAWX);
router.post("/updateUserAWX", functions.updateUserAWX);
router.post("/getAccountAWX", functions.FetchAccountAWX);
router.post("/getAccountRFIAWX", functions.FetchAccountRFIAWX);

router.post("/create-cardholder-awx", functions.createCardholderAWX);
router.get("/fetch-cardholder-awx", functions.fetchCardholderAWX);
router.get("/fetch-card-awx", functions.fetchCardDetailsAWX);
router.get(
  "/fetch-cardholder-details-awx",
  functions.fetchCardHolderDetailsAWX
);

router.post(
  "/upload-files-awx",
  upload.single("file"),
  functions.UploadFilesAWX
);
router.post("/respond-rfi-awx", functions.respondRFIAWX);

router.get("/delete-cardholder-awx", functions.DeleteCardholderAWX);
router.get("/invite-cardholder-awx", functions.InviteCardholderAWX);
//laxman
router.get("/card-details-awx", functions.CardDetailsAWX);
router.get("/card-info-awx", functions.CardInfoAWX);
router.post("/card-update-awx", functions.CardUpdateAWX);

// Batch Transfer routes
router.get("/batch-transfers", functions.ListBatchTransfers);
router.get("/batch-transfer-details", functions.GetBatchTransferDetails);
router.get("/batch-transfer-items", functions.GetBatchTransferItems);

router.post("/create-batch-transfer-awx", functions.CreateBatchTransferAWX);
router.post(
  "/add-items-to-batch-transfer-awx",
  functions.AddItemsToBatchTransferAWX
);
router.post(
  "/delete-items-from-batch-transfer-awx",
  functions.DeleteItemsFromBatchTransferAWX
);
router.post(
  "/get-batch-transfer-quote-awx",
  functions.GetBatchTransferQuoteAWX
);
router.post("/submit-batch-transfer-awx", functions.SubmitBatchTransferAWX);

export default router;
