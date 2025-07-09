import express from "express";
import * as functions from "../Controllers/SettingsController.js";
import multer from "multer";
import { onlyForActiveSubscription, onlyForPro } from "../../server.js";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();
 
// Send Otp for password change
router.get("/sendOTP", functions.SendOTP );

//reset password
router.get("/resetPassword", functions.resetPassword );

//Cognito Get User
router.get("/getCognitoUser", functions.getCognitoUser);

//Verify 2FA QR
router.get("/verify2faQR", functions.verify2faQR);

//Generate 2FA QR
router.get("/generate2faQR", functions.generate2faQR);

//Disable 2FA  or cognito Update
router.get("/disable2FA", functions.disable2FA);

//Branding 
 router.post("/branding", onlyForActiveSubscription, functions.setBranding);

 router.get("/getbrandingDetails", functions.getbrandingDetails);

 router.post("/uploadDocS3",upload.single('file'), functions.uploadDocS3);




export default router;