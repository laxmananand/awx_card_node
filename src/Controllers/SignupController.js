import axios from "axios";
import * as Constants from "../Modules/Constant.js";
import crypto from "crypto";
import speakeasy from "speakeasy";
import { SendEmail } from "./UtilityController.js";
import exportLog from "../Modules/exportLog.js";
import { SetSessionData, FetchSessionData } from "../Modules/SetSessionData.js";
import { createlead } from "./ZohoController.js";
import CryptoJS from "crypto-js";

//Signup
//Current date and time logic
const now = new Date();

// Get the individual components of the date and time
const day = String(now.getDate()).padStart(2, "0"); // Day (2 digits)
const month = String(now.getMonth() + 1).padStart(2, "0"); // Month (2 digits, months are zero-based)
const year = String(now.getFullYear()); // Year (2 digits)
const hours = String(now.getHours()).padStart(2, "0"); // Hours (2 digits)
const minutes = String(now.getMinutes()).padStart(2, "0"); // Minutes (2 digits)

// Concatenate the components in the desired format
const formattedDateTime = `${year}-${month}-${day}`;
const formattedTime = `${hours}:${minutes}`;

const decryptPassword = (encryptedPassword) => {
  const secretKey = process.env.password_secretkey; // Must match the frontend key
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
  const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
  return originalPassword;
};

//Login
export const getLoginStatus = async (req, res) => {
  const { email, password } = req.query;
  try {
    const url = process.env.base_url_cognito + Constants.signIn;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      username: email,
      password: decryptPassword(password),
      clientId: process.env.cognito_client_id,
      phoneNumber: "",
      userPoolId: process.env.cognito_pool_id,
    };

    const response = await axios.post(url, requestBody, { headers });
    let obj = response.data;
    if (obj?.authenticationResult?.AccessToken) {
      exportLog("Login", "success", email, { url, requestBody, headers }, obj);
      SetSessionData(obj?.authenticationResult?.AccessToken, {
        email,
      });
    } else if (obj?.errorCode) {
      if (obj?.errorCode === "UserLambdaValidationException") {
        let msg = obj?.msg || obj?.message;
        let split = msg?.split("operation: ");
        if (
          split[1] ===
          "PreAuthentication failed with error Maximum number of failed log-in attempts exceeded.."
        ) {
          SendEmail(email, "maximum_attempt_exceeded");
        }
      } else if (obj?.errorCode === "UserNotConfirmedException") {
        SetSessionData(`${email}-ConfirmSignup`, {
          email,
        });

        obj.cookie = `${email}-ConfirmSignup`;
      }
      exportLog("Login", "error", email, { url, requestBody, headers }, obj);
    }
    res.status(200).json(obj);
  } catch (error) {
    exportLog("Login", "catch", null, null, null);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//Signup
export const signup = async (req, res) => {
  const { email, password, phoneNumber, countrycode } = req.query;
  try {
    const url = process.env.base_url_cognito + Constants.signUp;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const customAttr = {
      isd_code: countrycode,
    };

    const requestBody = {
      email: email,
      password: decryptPassword(password),
      clientId: process.env.cognito_client_id,
      phoneNumber: "+" + countrycode + phoneNumber,
      userPoolId: process.env.cognito_pool_id,
      customAttributes: customAttr,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.ResponseMetadata?.HTTPStatusCode === 200) {
      exportLog(
        "Sign-up",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
      SendEmail(email, "confirm_signup");

      SetSessionData(obj?.UserSub, {
        email,
        phoneNumber: countrycode + phoneNumber,
      });
    } else if (obj?.errorCode) {
      exportLog("Sign-up", "error", email, { url, requestBody, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Sign-up", "catch", null, null, null);
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//Confirm Signup
export const confirmSignup = async (req, res) => {
  const { email, code } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);

    if (email !== SessionData.email) {
      res.status(200).json({
        status: "UNAUTHORIZED_ACCESS",
        message:
          "The email provided does not match the one associated with the current session. Please sign in again to continue.",
      });
      return;
    }

    const url = process.env.base_url_cognito + Constants.confirmSignUp;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      email: email,
      emailOTP: code,
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.ResponseMetadata?.HTTPStatusCode === 200) {
      exportLog(
        "Confirm Sign-up",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
      SendEmail(email, "signup_success");
    } else if (obj?.errorCode) {
      exportLog(
        "Confirm Sign-up",
        "error",
        email,
        { url, requestBody, headers },
        obj
      );
      if (obj.errorCode === "CodeMismatchException") {
        SendEmail(email, "wrong_verification_code");
      }
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Confirm Sign-up", "catch", null, null, null);
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//Resend Confirmation
export const resendConfirmation = async (req, res) => {
  const { email } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);

    if (email !== SessionData.email) {
      res.status(200).json({
        status: "UNAUTHORIZED_ACCESS",
        message:
          "The email provided does not match the one associated with the current session. Please sign in again to continue.",
      });
      return;
    }

    const url = process.env.base_url_cognito + Constants.resendConfirmationCode;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      email: email,
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.ResponseMetadata?.HTTPStatusCode === 200) {
      exportLog(
        "Resend Confirmation",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
      console.log(
        `${formattedDateTime} ${formattedTime}: Resend confirmation successful : ${email}.`
      );
    } else if (obj?.errorCode) {
      exportLog(
        "Resend Confirmation",
        "error",
        email,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Resend Confirmation", "catch", null, null, null);
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//GET User Status
export const GetUserStatus = async (req, res) => {
  const { email, platform } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);

    if (email !== SessionData.email) {
      res.status(200).json({
        status: "UNAUTHORIZED_ACCESS",
        message:
          "The email provided does not match the one associated with the current session. Please sign in again to continue.",
      });
      return;
    }

    const url =
      platform === "nium"
        ? process.env.base_url + Constants.UserStatusDetails
        : process.env.base_url_v2 + "/internal/api/v2/utilities/zoqquserstatus";

    const body = {
      email,
    };

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key":
        platform === "nium"
          ? process.env.x_api_key_zoqq
          : process.env.x_api_key,
      "x-email-id": email,
    };

    const response =
      platform === "nium"
        ? await axios.get(url, { headers })
        : await axios.post(url, body, { headers });

    let obj = response.data;

    if (obj?.userEmailId) {
      exportLog(
        "Get User Status",
        "success",
        email,
        { url: url, headers: headers },
        obj
      );

      SessionData.internalBusinessId = obj.internalBusinessId;

      SetSessionData(req.headers.authorization, SessionData);
    } else if (obj?.status === "BAD_REQUEST") {
      exportLog(
        "Get User Status",
        "error",
        email,
        { url: url, headers: headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get User Status", "catch", null, null, null);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//GET User Status
export const GetCognitoUserInfo = async (req, res) => {
  const { email } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);
    if (req.headers.authorization) {
      if (email !== SessionData.email) {
        res.status(200).json({
          status: "UNAUTHORIZED_ACCESS",
          message:
            "The email provided does not match the one associated with the current session. Please sign in again to continue.",
        });
        return;
      }
    }

    const url = process.env.base_url_cognito + Constants.getUserInfo;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
      email: email,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.ResponseMetadata?.HTTPStatusCode === 200) {
      exportLog(
        "Get Cognito User Info",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );

      let userAttributes = obj?.userAttributes;
      let phone = userAttributes?.find(
        (attr) => attr.name === "phone_number"
      )?.value;
      let cc = userAttributes?.find(
        (attr) => attr.name === "custom:isd_code"
      )?.value;
      let name = userAttributes?.find(
        (attr) => attr.name === "custom:contactName"
      )?.value;

      if (phone && cc) {
        let stripPhone = phone?.slice(1) || null;
        let phoneNumber = `+${cc}${stripPhone}`;
        SessionData.name = name || "Unknown Name"; // Fallback to 'Unknown Name' if not found
        SessionData.phone = phoneNumber;

        SetSessionData(req.headers.authorization, SessionData);
      } else {
        console.error("Cognito GetUser Error: Required attributes not found.");
      }
    } else if (obj?.errorCode) {
      exportLog(
        "Get Cognito User Info",
        "error",
        email,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Cognito User Info", "catch", null, null, null);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const UpdateCognitoAttributes = async (req, res) => {
  const {
    email,
    personName,
    businessName,
    countryName,
    countrycode,
    phoneNumber,
    type,
  } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);

    if (email !== SessionData.email) {
      res.status(200).json({
        status: "UNAUTHORIZED_ACCESS",
        message:
          "The email provided does not match the one associated with the current session. Please sign in again to continue.",
      });
      return;
    }

    const url =
      process.env.base_url_cognito + Constants.adminUpdateUserAttributes;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    if (type === "insert") {
      req.body = req.query;
      req.body.phoneNumber = SessionData.phoneNumber;
      await createlead(req);
    }

    const customAttr = {};

    if (personName) {
      customAttr["custom:contactName"] = personName;
    }

    if (businessName) {
      customAttr["custom:businessName"] = businessName;
    }

    if (countryName) {
      customAttr["custom:countryName"] = countryName;
    }

    if (countrycode) {
      customAttr["custom:isd_code"] = countrycode;
    }

    if (phoneNumber) {
      customAttr["phone_number"] = "+" + countrycode + phoneNumber;
    }

    const requestBody = {
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
      email: email,
      customAttributes: customAttr,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.ResponseMetadata?.HTTPStatusCode === 200) {
      exportLog(
        "Update Cognito User Attribute",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
    } else if (obj?.errorCode) {
      exportLog(
        "Update Cognito User Attribute",
        "error",
        email,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Update Cognito User Attribute", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Get user persona and features details
export const UserPersonaDetails = async (req, res) => {
  try {
    const url = process.env.base_url + Constants.userPersonaDetails;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_program_id,
    };

    const response = await axios.get(url, { headers });
    let obj = response.data;

    if (obj?.length > 0) {
      exportLog(
        "Fetch User Persona Details",
        "success",
        null,
        { url: url, headers: headers },
        obj
      );
    } else if (obj?.status === "BAD_REQUEST") {
      exportLog(
        "Fetch User Persona Details",
        "error",
        null,
        { url: url, headers: headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Fetch User Persona Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const UserPersonaFeatures = async (req, res) => {
  const { userPersona } = req.query;
  try {
    const url = process.env.base_url + Constants.userPersonaFeatures;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-profession-id": userPersona,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;

    if (!obj?.status) {
      exportLog(
        "Fetch User Persona Features",
        "success",
        null,
        { url: url, headers: headers },
        obj
      );
    } else if (obj?.status === "BAD_REQUEST") {
      exportLog(
        "Fetch User Persona Features",
        "error",
        null,
        { url: url, headers: headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Fetch User Persona Features", "catch", null, null, null);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//GET User Status
export const GetUserOnboardingStatus = async (req, res) => {
  const { brn } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);

    if (SessionData.internalBusinessId) {
      if (brn !== SessionData.internalBusinessId) {
        res.status(200).json({
          status: "UNAUTHORIZED_ACCESS",
          message:
            "The Business-ID provided does not match the one associated with the current session. Please sign-in again to continue.",
        });
        return;
      }
    }

    const url =
      process.env.base_url + Constants.CustomerDetailsByBusinessId + "/" + brn;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      // "x-business-id": brn,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data[0];

    if (obj?.customerHashId) {
      exportLog(
        "Fetch Onboarding Details",
        "success",
        brn,
        { url: url, headers: headers },
        obj
      );

      SessionData.customerHashId = obj.customerHashId;
      SessionData.clientId = obj.clientId;
      SessionData.caseId = obj.caseId;
      SessionData.walletHashId = obj.walletHashId;
      SessionData.kycUrl = obj.kycUrl;

      SetSessionData(req.headers.authorization, SessionData);
    } else if (obj?.status === "BAD_REQUEST") {
      exportLog(
        "Fetch Onboarding Details",
        "error",
        brn,
        { url: url, headers: headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Fetch Onboarding Details", "catch", null, null, null);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Send OTP for forget password request
export const sendOTP = async (req, res) => {
  const { email } = req.query;
  try {
    const url = process.env.base_url_cognito + Constants.forgotPassword;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
      username: email,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.ResponseMetadata?.HTTPStatusCode === 200) {
      exportLog(
        "Send OTP",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
      SendEmail(email, "reset_password_start");
    } else if (obj?.errorCode) {
      exportLog("Send OTP", "error", email, { url, requestBody, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Send OTP", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Reset password cognito
export const resetPassword = async (req, res) => {
  const { email, code, password } = req.query;
  try {
    const url = process.env.base_url_cognito + Constants.resetPassword;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
      username: email,
      newPassword: password,
      mfacode: code,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.ResponseMetadata?.HTTPStatusCode === 200) {
      exportLog(
        "Reset Password",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
      SendEmail(email, "reset_password_success");
    } else if (obj?.errorCode) {
      exportLog(
        "Reset Password",
        "error",
        email,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Reset Password", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Generate QR Code
export const generateQR = async (req, res) => {
  const { email } = req.query;

  try {
    let SessionData = await FetchSessionData(req.headers);

    // if (email !== SessionData.email) {
    //   res.status(200).json({
    //     status: "UNAUTHORIZED_ACCESS",
    //     message:
    //       "The email provided does not match the one associated with the current session. Please sign-in again to continue.",
    //   });
    //   return;
    // }

    // Generate a secret key
    const secretKey = speakeasy.generateSecret({ length: 20 }).base32;

    const issuer = "Zoqq";
    const account = email;

    // Generate an OTP URI
    const otpauthUri = speakeasy.otpauthURL({
      secret: secretKey,
      label: `${issuer}:${account}`,
      issuer: issuer,
      encoding: "base32",
      algorithm: "sha1", // You can adjust this based on your needs
    });

    if (secretKey && otpauthUri) {
      exportLog(
        "Generate QR Code",
        "success",
        email,
        {
          secret: secretKey,
          label: `${issuer}:${account}`,
          issuer: issuer,
          encoding: "base32",
          algorithm: "sha1", // You can adjust this based on your needs
        },
        { secretKey: secretKey, barData: otpauthUri }
      );
    } else {
      exportLog(
        "Generate QR Code",
        "error",
        email,
        {
          secret: secretKey,
          label: `${issuer}:${account}`,
          issuer: issuer,
          encoding: "base32",
          algorithm: "sha1", // You can adjust this based on your needs
        },
        { secretKey: secretKey, barData: otpauthUri }
      );
    }

    res
      .status(200)
      .json(JSON.stringify({ secretKey: secretKey, barData: otpauthUri }));
  } catch (error) {
    exportLog("Generate QR Code", "catch", null, null, null);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const verifyQRCode = async (req, res) => {
  const { otp, secretKey, email } = req.query;

  try {
    let SessionData = await FetchSessionData(req.headers);

    if (email !== SessionData.email) {
      res.status(200).json({
        status: "UNAUTHORIZED_ACCESS",
        message:
          "The email provided does not match the one associated with the current session. Please sign-in again to continue.",
      });
      return;
    }

    // Replace 'time' with the current time in seconds
    const time = Math.floor(Date.now() / 1000);

    const otpOptions = {
      secret: secretKey,
      encoding: "base32",
      token: otp,
      time,
      window: 1, // Check the current and previous time steps for validity
    };

    const isValid = speakeasy.totp.verify(otpOptions);

    //console.log(isValid);

    if (isValid) {
      //console.log("Verification successful!");

      //Upating cognito attributes when verification successful
      try {
        const url =
          process.env.base_url_cognito + Constants.adminUpdateUserAttributes;
        const headers = {
          "x-region-id": req.query.region,
          "Content-Type": "application/json",
          "x-api-key": process.env.x_api_key,
        };

        const customAttr = {
          "custom:enable_fa": "Y",
          "custom:fa_secretkey": secretKey,
        };

        const requestBody = {
          clientId: process.env.cognito_client_id,
          userPoolId: process.env.cognito_pool_id,
          email: email,
          customAttributes: customAttr,
        };

        const response = await axios.post(url, requestBody, { headers });
        let obj = response.data;
        if (obj.ResponseMetadata.HTTPStatusCode === 200) {
          exportLog(
            "Update 2FA Code",
            "success",
            email,
            { url, requestBody, headers },
            obj
          );
          res.status(200).json({
            status: "SUCCESS",
            message: "OTP Verification successful!",
          });
        } else {
          exportLog(
            "Update 2FA Code",
            "error",
            email,
            { url, requestBody, headers },
            obj
          );
          res
            .status(400)
            .json({ status: "BAD_REQUEST", message: "2FA update failed!" });
        }
      } catch (error) {
        exportLog("Update 2FA Code", "catch", null, null, null);
        res.status(500).json({
          status: "INTERNAL_SERVER_ERROR",
          message: `Error during update: ${error.message}`,
        });
      }
    } else {
      exportLog("2FA Verification", "error", email, otpOptions, {
        status: "FAILURE",
        message: "OTP Verification failed!",
      });

      res
        .status(200)
        .json({ status: "FAILURE", message: "OTP Verification failed!" });
    }
  } catch (error) {
    exportLog("2FA Verification", "catch", null, null, null);
    res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      message: `Error during verification: ${error.message}`,
    });
  }
};

export const verifyQRCode2 = async (req, res) => {
  const { otp, secretKey } = req.query;

  try {
    // Replace 'time' with the current time in seconds
    const time = Math.floor(Date.now() / 1000);

    const otpOptions = {
      secret: secretKey,
      encoding: "base32",
      token: otp,
      time,
      window: 1, // Check the current and previous time steps for validity
    };

    const isValid = speakeasy.totp.verify(otpOptions);

    if (isValid) {
      exportLog("Verify 2FA", "success", null, otpOptions, isValid);

      res
        .status(200)
        .json({ status: "SUCCESS", message: "OTP Verification successful!" });
    } else {
      exportLog("Verify 2FA", "error", null, otpOptions, null);

      res
        .status(200)
        .json({ status: "FAILURE", message: "OTP Verification failed!" });
    }
  } catch (error) {
    exportLog("Verify 2FA", "catch", null, null, null);

    res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      message: `Error during verification: ${error.message}`,
    });
  }
};

//Authenticate User
export const AuthenticateUser = async (req, res) => {
  let json = { status: "SUCCESS", message: "USER IS LOGGED-IN" };

  try {
    res.status(200).json(json.status);
  } catch (error) {
    exportLog("Login", "catch", null, null, null);

    (json.status = "BAD_REQUEST"),
      (json.message = "SOMETHING WENT WRONG, PLEASE TRY AGAIN LATER!");
    res.status(500).json(json.status);
  }
};

export const Reset2FA = async (req, res) => {
  //Upating cognito attributes for resetting 2fa
  const { email } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);

    if (email !== SessionData.email) {
      res.status(200).json({
        status: "UNAUTHORIZED_ACCESS",
        message:
          "The email provided does not match the one associated with the current session. Please sign-in again to continue.",
      });
      return;
    }

    const url =
      process.env.base_url_cognito + Constants.adminUpdateUserAttributes;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const customAttr = {
      "custom:enable_fa": "N",
      "custom:fa_secretkey": "",
    };

    const requestBody = {
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
      email: email,
      customAttributes: customAttr,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj.ResponseMetadata.HTTPStatusCode === 200) {
      exportLog(
        "Reset 2FA",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Reset 2FA",
        "error",
        email,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(obj);
  } catch (error) {
    exportLog("Reset 2FA", "catch", null, null, null);

    res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      message: `Error during update: ${error.message}`,
    });
  }
};

export const ResetTemporaryPassword = async (req, res) => {
  const { username, tempPassword, newPassword } = req.query;
  try {
    const url = process.env.base_url_cognito + "signInForceChangePassword";
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      username,
      tempPassword,
      clientId: process.env.cognito_client_id,
      newPassword,
      userPoolId: process.env.cognito_pool_id,
      challengeName: "",
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("ResetTemporaryPassword", "catch", null, null, null);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const ResendTemporaryPassword = async (req, res) => {
  const { email, phoneNumber } = req.query;
  try {
    const url = process.env.base_url_cognito + "resendTemporaryPassword";
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      email,
      phoneNumber,
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("ResendTemporaryPassword", "catch", null, null, null);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const Setup2FA = async (req, res) => {
  //Upating cognito attributes for resetting 2fa
  const { email, type } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);

    if (email !== SessionData.email) {
      res.status(200).json({
        status: "UNAUTHORIZED_ACCESS",
        message:
          "The email provided does not match the one associated with the current session. Please sign-in again to continue.",
      });
      return;
    }

    const url =
      process.env.base_url_cognito + Constants.adminUpdateUserAttributes;
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const customAttr = {
      "custom:enable_fa": "",
      "custom:fa_secretkey": "",
    };

    if (type === "2FA") {
      customAttr["custom:enable_fa"] = "N";
    } else if (type === "OTP") {
      customAttr["custom:enable_fa"] = "P";
    } else if (type === "SKIP") {
      customAttr["custom:enable_fa"] = "NA";
    }

    const requestBody = {
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
      email: email,
      customAttributes: customAttr,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj.ResponseMetadata.HTTPStatusCode === 200) {
      exportLog(
        "Setup 2-Step Verification",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Setup 2-Step Verification",
        "error",
        email,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(obj);
  } catch (error) {
    exportLog("Setup 2-Step Verification", "catch", null, null, null);

    res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      message: `Error during update: ${error.message}`,
    });
  }
};
