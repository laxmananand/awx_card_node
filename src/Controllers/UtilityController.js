import axios from "axios";
import * as Constants from "../Modules/Constant.js";
import crypto from "crypto";

//List Country Code
export const listCountryCode = async (req, res) => {
  try {
    const url =
      process.env.base_url_v2 +
      "/internal/api/v2/utilities/getmobilecountrylist";
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      //programCode: xProgramId_zoqq,
      programCode: "ZOQQ",
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//List Country Code
export const listCountry = async (req, res) => {
  try {
    const url =
      process.env.base_url_v2 + "/internal/api/v2/utilities/getcountrylist";
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      //programCode: xProgramId_zoqq,
      programCode: "ZOQQ",
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//List Nationality
export const listNationality = async (req, res) => {
  try {
    const url =
      process.env.base_url_v2 + "/internal/api/v2/utilities/getnationalitylist";
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const requestBody = {
      //programCode: xProgramId_zoqq,
      programCode: "ZOQQ",
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//Fetch Enum Values - NIUM
export const FetchEnumValues = async (req, res) => {
  const { category, region } = req.query;
  try {
    const url = process.env.base_url + "/zoqq/api/v2/onboarding/EnumDetails";
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
    };

    const requestBody = {
      category: category,
      region: region,
      type: "CORPORATE",
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//Auth User
export const AuthUser = async (req, res) => {
  const { email } = req.query;
  try {
    const user = req.myCache.get(email);
    if (user) {
      // If user is logged in, send the user details in the response

      res.status(200).json({ status: "SUCCESS", message: user });
    } else {
      // If user is not logged in, redirect to login page or send an error response
      res.status(200).json({
        status: "ERROR",
        message: "Unauthorized Access",
        cache: user || "Email not found",
      });
    }
  } catch (error) {
    res.status(500).json({ status: "BAD_REQUEST", message: "Network Error" });
  }
};

//Delete User
export const Logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Error destroying session");
    }
    return res.status(200).json({ message: "Node session destroyed" });
  });
};

export const FetchSecretKey = async (req, res) => {
  res.status(200).json({ secretKey: process.env.secret_key });
};

const supportEmail = "notification@zoqq.com";
export const SendEmail = async (to, templateName) => {
  try {
    const url = `${process.env.mail_base_url}/send_mail`;
    const headers = {
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-api-key": process.env.x_api_key,
    };

    let templateId;
    let subject;

    switch (templateName) {
      case "confirm_signup":
        templateId = "d-0f18d7fce080489c863b44423cbfc391";
        subject = "Confirm Your Signup";
        break;
      case "signup_success":
        templateId = "d-10c10e0edee545adadcb9abd701e79c5";
        subject = "Welcome! Your Signup Was Successful";
        break;
      case "wrong_verification_code":
        templateId = "d-d570cd8e350b4ce3a9aad5344845b83c";
        subject = "Incorrect Verification Code";
        break;
      case "reset_password_success":
        templateId = "d-9ce0c4fd9edd42bab2ee326b96ede93f";
        subject = "Your Password Has Been Reset Successfully";
        break;
      case "reset_password_start":
        templateId = "d-d9d997e853bd49ad8d6fc9454e2745e2";
        subject = "Reset Your Password";
        break;
      case "maximum_attempt_exceeded":
        templateId = "d-d9d997e853bd49ad8d6fc9454e2745e2";
        subject = "Maximum Attempts Exceeded for Verification";
        break;
      default:
        templateId = "reset";
        subject = "Default Subject";
        break;
    }

    if (!templateId || templateId === "reset") {
      return "Invalid Template Id";
    }

    const requestBody = {
      to: to,
      subject: subject,
      sender_email: supportEmail,
      sendgrid_template_id: templateId,
      stylopay_support_email: "support@zoqq.com",
      user_email: to,
    };

    const response = await axios.post(url, requestBody, { headers });
    return response.data;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const FetchIpAndSessionId = async (req, res) => {
  try {
    let body = {
      env: process.env.x_env_id,
      token: process.env.ip_token,
    };
    res.status(200).json(body);
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};
