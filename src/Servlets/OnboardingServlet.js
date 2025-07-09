// Common Routes
import express from "express";
import * as functions from "../Controllers/OnboardingController.js";
import multer from "multer";

// Define the storage for uploaded files (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/getBusinessList", functions.getBusinessList);
router.get("/getBusinessDetails", functions.getBusinessDetails);

//General Details
router.get(
  "/getBusinessIncorporationDetails",
  functions.getBusinessIncorporationDetails
);
router.get("/postBusinessAddressDetails", functions.postBusinessAddressDetails);
router.get(
  "/patchBusinessAddressDetails",
  functions.patchBusinessAddressDetails
);

//Business Details
router.get(
  "/getAdditionalBusinessDetails",
  functions.getAdditionalBusinessDetails
);
router.post("/postRiskAssessmentInfo", functions.postRiskAssessmentInfo);
router.post("/patchRiskAssessmentInfo", functions.patchRiskAssessmentInfo);

//Applicant Details
router.get(
  "/GetApplicantBusinessDetails",
  functions.GetApplicantBusinessDetails
);
router.get(
  "/postApplicantContactDetails",
  functions.postApplicantContactDetails
);
router.get(
  "/patchApplicantContactDetails",
  functions.patchApplicantContactDetails
);

//Stakeholder Details
router.get("/GetStakeholderDetails", functions.GetStakeholderDetails);
router.get(
  "/PostBusinessPartnerAddressDetails",
  functions.PostBusinessPartnerAddressDetails
);
router.get(
  "/PatchBusinessPartnerAddressDetails",
  functions.PatchBusinessPartnerAddressDetails
);
router.get(
  "/DeleteBusinessPartnerAddressDetails",
  functions.DeleteBusinessPartnerAddressDetails
);

//Business KYB Details
router.post(
  "/UploadDocumentsApplicant",
  upload.fields([
    { name: "applicantDocumentFile", maxCount: 1 },
    { name: "applicantDocumentFilePOA", maxCount: 1 },
  ]),
  functions.UploadDocuments
);
router.post(
  "/UploadDocumentsBusiness",
  upload.single("businessDocumentFile"),
  functions.UploadDocumentsBusiness
);
router.post(
  "/UploadDocumentsStakeholder",
  upload.fields([
    { name: "stakeholderDocumentFile", maxCount: 1 },
    { name: "stakeholderDocumentFilePOA", maxCount: 1 },
  ]),
  functions.UploadDocumentsStakeholder
);
router.post(
  "/UploadDocumentLOA",
  upload.fields([{ name: "applicantDocumentFile", maxCount: 1 }]),
  functions.UploadDocumentLOA
);

//Submit to NIUM
router.get("/OnboardEKYCUser", functions.OnboardEKYCUser);
router.get("/GetTerms&Conditions", functions.GetTCs);

//NIUM User Details
router.get("/getKycStatusClient", functions.GetUserDetailsClient);
router.get("/GetRFIDetails", functions.GetRFIDetails);
router.post("/RespondToRFI", upload.any(), functions.RespondRFI);
router.post(
  "/RespondToRFIOtherDocument",
  upload.any(),
  functions.RespondRFIOtherDocument
);

//Transaction RFI APIs
router.get("/GetTransactionRFIDetails", functions.GetTransactionRFIDetails);
router.post(
  "/RespondTransactionRFIDetails",
  upload.any(),
  functions.RespondTransactionRFI
);

router.get("/regeneratekycurl", functions.RegenerateKycUrl);
router.get("/sendresetotp", functions.SendResetOtp);
router.get("/verifyresetotp", functions.VerifyResetOtp);

export default router;
