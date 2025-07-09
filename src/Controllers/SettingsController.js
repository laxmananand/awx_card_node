import axios, { AxiosError } from "axios";
import * as Constants from "../Modules/Constant.js";
import crypto from "crypto";
import speakeasy from "speakeasy";
import FormData from "form-data";
import * as Constant2 from "../Modules/SettingsModuleConstant.js";

//Send OTP for forget password request
export const SendOTP = async (req, res) => {
  const { email } = req.query;
  try {
    const url = process.env.base_url_cognito + Constants.forgotPassword;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
      username: email,
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

// reset password

export const resetPassword = async (req, res) => {
  const { email, code, password } = req.query;
  try {
    const url = process.env.base_url_cognito + Constants.resetPassword;
    const headers = {
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
    res.status(200).json(response.data);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//GET User Status
export const getCognitoUser = async (req, res) => {
  const { email } = req.query;
  try {
    const url = process.env.base_url_cognito + Constants.getUserInfo;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
      email: email,
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Generate QR Code
export const generate2faQR = async (req, res) => {
  const { email } = req.query;

  try {
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

    res
      .status(200)
      .json(JSON.stringify({ secretKey: secretKey, barData: otpauthUri }));
  } catch (error) {
    //console.error(error);
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

// verify QR code
export const verify2faQR = async (req, res) => {
  const { otp, secretKey, email } = req.query;

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

    //console.log(isValid);

    if (isValid) {
      //console.log("Verification successful!");

      //Upating cognito attributes when verification successful
      try {
        const url =
          process.env.base_url_cognito + Constants.adminUpdateUserAttributes;
        const headers = {
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
          res
            .status(200)
            .json({
              status: "SUCCESS",
              message: "OTP Verification successful!",
            });
        } else {
          res
            .status(400)
            .json({ status: "BAD_REQUEST", message: "2FA update failed!" });
        }
      } catch (error) {
        res
          .status(500)
          .json({
            status: "INTERNAL_SERVER_ERROR",
            message: `Error during update: ${error.message}`,
          });
      }
    } else {
      //console.log("Verification failed!");
      res
        .status(200)
        .json({ status: "FAILURE", message: "OTP Verification failed!" });
    }
  } catch (error) {
    //console.error("Error during verification:", error);
    res
      .status(500)
      .json({
        status: "INTERNAL_SERVER_ERROR",
        message: `Error during verification: ${error.message}`,
      });
  }
};

// Disable 2FA

// verify QR code
export const disable2FA = async (req, res) => {
  const { email } = req.query;

  //Upating cognito attributes when verification successful
  try {
    const url =
      process.env.base_url_cognito + Constants.adminUpdateUserAttributes;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const customAttr = {
      "custom:enable_fa": "N",
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
      res
        .status(200)
        .json({
          status: "SUCCESS",
          message: "2FA has been successfully disabled.",
        });
    } else {
      res
        .status(400)
        .json({ status: "BAD_REQUEST", message: "2FA update failed!" });
    }
  } catch (error) {
    res
      .status(500)
      .json({
        status: "INTERNAL_SERVER_ERROR",
        message: `Error during update: ${error.message}`,
      });
  }
};

// Branding Controller

export const setBranding = async (req, res) => {
  // const { companyId,brandName,domainName,colours,logoUrl,fonts } = req.query;

  const brandingDetails = req.body;

  //Upating cognito attributes when verification successful
  try {
    const url = process.env.base_url_v2 + Constant2.setBranding;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      companyId: brandingDetails?.companyId,
      brandName: brandingDetails?.brandName,
      domainName: brandingDetails?.domainName,
      colours: brandingDetails?.colours,
      logoUrl: brandingDetails?.logoUrl,
      fonts: brandingDetails?.fonts,
    };

    const response = await axios.post(url, requestBody, { headers });
    let obj = response.data;
    res.status(200).json(obj);
  } catch (error) {
    res
      .status(500)
      .json({
        status: "INTERNAL_SERVER_ERROR",
        message: `Error during update: ${error.message}`,
      });
  }
};

// Get Branding Details

export const getbrandingDetails = async (req, res) => {
  const { companyId } = req.query;

  //Upating cognito attributes when verification successful
  try {
    const url = process.env.base_url_v2 + Constant2.getBranding;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      companyId: companyId,
    };

    const response = await axios.post(url, requestBody, { headers });
    let obj = response.data;
    res.status(200).json(obj);
  } catch (error) {
    res.status(500).json(error);
  }
};

// Upload S3

export const uploadDocS3 = async (req, res) => {
  try {
    const uploadedFile = req.body;
    // const formData = new FormData();

    //     if (uploadedFile) {
    //       formData.append("file", uploadedFile.buffer, {
    //         filename: uploadedFile.originalname,
    //         contentType: uploadedFile.mimetype,
    //       });
    //     } else {
    //       formData.append("file", "hi");
    //     }

    //     let config = {
    //       method: 'post',
    //       url: process.env.base_url_v2 + Constant2.uploadDocS3,
    //       headers: {
    //         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    //         "x-api-key": process.env.x_api_key,
    //         ...formData.getHeaders()
    //       },
    //       data: formData
    //     };

    const requestBody = {
      file: uploadedFile.file,
      filename: uploadedFile.filename,
      region: process.env.region,
      bucket: process.env.bucket,
    };
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key, // Retain API key if needed
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      timeout: 40000,
    };

    const config = {
      method: "post",
      url: `${"https://api.sandbox.stylopay.com"}${Constant2.uploadDocS3}`, // Use template literal
      headers: headers,
      data: requestBody, // Send the updated request body
    };

    const response = await axios(config);
    console.log(JSON.stringify(response.data));
    let obj = response.data;
    res.status(200).json(obj);
  } catch (error) {
    res.status(500).json(error);
  }
};
