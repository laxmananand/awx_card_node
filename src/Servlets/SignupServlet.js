// signup Routes
import express from "express";
import * as functions from "../Controllers/SignupController.js";

const router = express.Router();

router.get("/login", functions.getLoginStatus);
router.get("/signup", functions.signup);
router.get("/confirmSignup", functions.confirmSignup);
router.get("/resendConfirmation", functions.resendConfirmation);
router.get("/getuserstatus", functions.GetUserStatus);
router.get("/getcognitouserinfo", functions.GetCognitoUserInfo);
router.get("/updatecognitoattributes", functions.UpdateCognitoAttributes);
router.get("/getuseronboardingstatus", functions.GetUserOnboardingStatus);
router.get("/sendOTP", functions.sendOTP);
router.get("/resetPassword", functions.resetPassword);
router.get("/generateQR", functions.generateQR);
router.get("/verifyQR", functions.verifyQRCode);
router.get("/verifyQR2", functions.verifyQRCode2);
router.get("/reset2fa", functions.Reset2FA);
router.get("/setup2fa", functions.Setup2FA);

//Get Feature and User Persona Details
router.get("/userpersonadetails", functions.UserPersonaDetails);
router.get("/userpersonafeatures", functions.UserPersonaFeatures);

router.get("/resettemporarypassword", functions.ResetTemporaryPassword);
router.get("/resendtemporarypassword", functions.ResendTemporaryPassword);

export default router;
