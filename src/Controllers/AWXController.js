import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";
import exportLog from "../Modules/exportLog.js";
import * as constant from "../Modules/Expensemodconstant.js";

//auto-deploy-test-1

//Onboarding
const currentDate = new Date();

const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
const day = String(currentDate.getDate()).padStart(2, "0");
const hours = String(currentDate.getHours()).padStart(2, "0");
const minutes = String(currentDate.getMinutes()).padStart(2, "0");
const seconds = String(currentDate.getSeconds()).padStart(2, "0");

const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

let xEnvId = process.env.x_env_id || "production";

import moment from "moment"; // Import moment.js

// Function to detect the format of a given date string
const detectDateFormat = (dateString) => {
  const formats = [
    "YYYY-MM-DD", // Correct format
    "DD/MM/YYYY",
    "MM-DD-YYYY",
    "ddd, DD MMM YYYY HH:mm:ss GMT", // Tue, 01 Feb 2000 18:30:00 GMT
  ];

  for (const format of formats) {
    if (moment(dateString, format, true).isValid()) {
      return format; // Return the matching format
    }
  }
  return "Unknown format"; // If no format matches
};

// Function to convert any valid date string to `YYYY-MM-DD` format
const convertToYYYYMMDD = (dateString) => {
  const detectedFormat = detectDateFormat(dateString);

  if (detectedFormat === "YYYY-MM-DD") {
    return dateString; // Already in correct format, return as is
  } else if (detectedFormat !== "Unknown format") {
    // Convert to `YYYY-MM-DD`
    return moment(dateString, detectedFormat).format("YYYY-MM-DD");
  } else {
    return moment(dateString, detectedFormat).format("YYYY-MM-DD");

    throw new Error("Invalid date format"); // Handle unknown format
  }
};

export const createAccountAWX = async (req, res) => {
  const { email, businessName, tC, dataUsage, authToken } = req.body;
  try {
    const url = process.env.VITE_AWX_baseUrl + "/api/v1/accounts/create";

    const body = {
      primary_contact: {
        email: email,
      },
      account_details: {
        business_details: {
          business_name: businessName,
        },
      },
      customer_agreements: {
        agreed_to_terms_and_conditions: true,
        agreed_to_data_usage: true,
      },
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
    };

    const requestBody = {};

    const curlCommand =
      `curl --location '${url}' \\\n` +
      Object.entries(headers)
        .map(([key, value]) => `  --header '${key}: ${value}' \\`)
        .join("\n") +
      `\n` +
      `  --data '${JSON.stringify(body, null, 2)}'`;

    console.log(curlCommand);

    const response = await axios.post(url, body, { headers });

    let obj = response.data;
    if (obj?.id) {
      exportLog(
        "Create Account AWX",
        "success",
        null,
        { url, body, headers },
        obj
      );
    } else {
      exportLog(
        "Create Account AWX",
        "error",
        null,
        { url, body, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Create Account AWX", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: { error } });
  }
};

export const generateAuthToken = async (req, res) => {
  try {
    const url = `${process.env.VITE_AWX_baseUrl}/api/v1/authentication/login`;

    const headers = {
      "x-client-id": process.env.VITE_AWX_clientId,
      "x-api-key": process.env.VITE_AWX_apiKey,
      "Content-Type": "application/json",
    };

    console.log(`Requesting API Token from: ${url}`);

    const response = await axios.post(url, {}, { headers });

    if (response.data?.token) {
      exportLog(
        "Generate Auth Token",
        "success",
        null,
        { url, headers },
        response.data
      );
      return res.status(200).json({ apiToken: response.data.token });
    } else {
      exportLog(
        "Generate Auth Token",
        "error",
        null,
        { url, headers },
        response.data
      );
      return res.status(400).json({ message: "Failed to generate API token" });
    }
  } catch (error) {
    console.error("Error generating API token:", error);
    exportLog("Generate Auth Token", "catch", null, null, null);
    return res
      .status(500)
      .json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const authorizeAccountAWX = async (req, res) => {
  const { accountId, codeChallenge, authToken, scope } = req.body;

  console.log("scope: ", scope);

  try {
    const url = `${process.env.VITE_AWX_baseUrl}/api/v1/authentication/authorize`;

    const body = {
      code_challenge: codeChallenge || process.env.VITE_AWX_codeChallenge,
      scope: scope,
    };

    const headers = {
      "x-on-behalf-of": accountId,
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    console.log(`Authorizing Account: ${accountId}`);

    const response = await axios.post(url, body, { headers });

    if (response.data?.authorization_code) {
      exportLog(
        "Authorize Account AWX",
        "success",
        null,
        { url, body, headers },
        response.data
      );
      return res
        .status(200)
        .json({ authCode: response.data.authorization_code });
    } else {
      exportLog(
        "Authorize Account AWX",
        "error",
        null,
        { url, body, headers },
        response.data
      );
      return res.status(400).json({ message: "Failed to authorize account" });
    }
  } catch (error) {
    console.error("Error authorizing account:", error);
    exportLog("Authorize Account AWX", "catch", null, null, null);
    return res
      .status(500)
      .json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const updateUserAWX = async (req, res) => {
  const { email, accountId, lastScreenCompleted, userStatus } = req.body;

  try {
    const url = `${process.env.base_url_v2}/internal/api/v2/utilities/zoqqaccountcreation`;

    const body = {
      internal_business_id: accountId,
      user_email_id: email,
      last_screen_completed: lastScreenCompleted,
      user_status: userStatus,
    };

    const headers = {
      "x-api-key": process.env.x_api_key,
      "Content-Type": "application/json",
    };

    const response = await axios.post(url, body, { headers });

    if (response.data?.statusCode === 200) {
      exportLog(
        "Update User Status AWX",
        "success",
        null,
        { url, body, headers },
        response.data
      );
      return res.status(200).json(response.data);
    } else {
      exportLog(
        "Update User Status AWX",
        "error",
        null,
        { url, body, headers },
        response.data
      );
      return res.status(400).json(response.data);
    }
  } catch (error) {
    console.error("Update User Status AWX:", error);
    exportLog("Update User Status AWX", "catch", null, null, null);
    return res
      .status(500)
      .json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const FetchAccountAWX = async (req, res) => {
  const { accountId, authToken } = req.body;
  try {
    const url = process.env.VITE_AWX_baseUrl + "/api/v1/accounts/" + accountId;

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj) {
      exportLog("Fetch Account AWX", "success", null, { url, headers }, obj);
    } else {
      exportLog("Fetch Account AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Fetch Account AWX", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: { error } });
  }
};

export const FetchAccountRFIAWX = async (req, res) => {
  const { accountId, authToken } = req.body;
  try {
    const url = process.env.VITE_AWX_baseUrl + "/api/v1/rfis";

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
      "x-on-behalf-of": accountId,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj) {
      exportLog(
        "Fetch Account RFI AWX",
        "success",
        null,
        { url, headers },
        obj
      );
    } else {
      exportLog("Fetch Account RFI AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Fetch Account RFI AWX", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: { error } });
  }
};

export const createCardholderAWX = async (req, res) => {
  const { accountId, authToken } = req.query;
  try {
    const url =
      process.env.VITE_AWX_baseUrl + "/api/v1/issuing/cardholders/create";

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
      "x-on-behalf-of": accountId,
    };

    const body = req.body;

    const response = await axios.post(url, body, { headers });

    let obj = response.data;
    if (obj) {
      exportLog(
        "Create Cardholder AWX",
        "success",
        null,
        { url, headers },
        obj
      );
    } else {
      exportLog("Create Cardholder AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Create Cardholder AWX", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: { error } });
  }
};
//laxman
export const fetchCardholderAWX = async (req, res) => {
  const { accountId, authToken } = req.query;
  try {
    const url = process.env.VITE_AWX_baseUrl + "/api/v1/issuing/cardholders";

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
      "x-on-behalf-of": accountId,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj) {
      exportLog(
        "Create Cardholder AWX",
        "success",
        null,
        { url, headers },
        obj
      );
    } else {
      exportLog("Create Cardholder AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Create Cardholder AWX", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: { error } });
  }
};

//laxman
// export const fetchCardHolderDetailsAWX = async (req, res) => {
//   const { id } = req.query;
//   try {
//     const url = `${process.env.baseUrl_zoqq_cards}${constant.listCardHolders_AWX}?id=${id}`;
//     console.log("url: ", url);

//     if (!id) {
//       return res.status(400).json({
//         status: "BAD_REQUEST",
//         message: "id is required",
//       });
//     }

//     const headers = {
//       // "Content-Type": "application/json",
//       // Authorization: "Bearer " + authToken,
//       // "x-on-behalf-of": accountId,
//       "x-api-key": process.env.x_api_key_zoqq,
//       "x-product-id": process.env.x_product_id,
//       "x-user-id": req.headers["x-user-id"],
//       "x-request-id":
//         req.headers["x-request-id"] || "211dc6c5-ad34-4534-86df-823e8a1a75ea",
//     };

//     const response = await axios.get(url, { headers });

//     let obj = response.data;
//     if (obj) {
//       exportLog(
//         "Fetch Card Holder Details AWX",
//         "success",
//         null,
//         { url, headers },
//         obj
//       );
//     } else {
//       exportLog(
//         "Fetch Card Holder Details AWX",
//         "error",
//         null,
//         { url, headers },
//         obj
//       );
//     }

//     res.status(200).json(response.data);
//   } catch (error) {
//     exportLog("Fetch Card Holder Details AWX", "catch", null, null, null);

//     res.status(500).json({ status: "BAD_REQUEST", message: { error } });
//   }
// };


export const fetchCardHolderDetailsAWX = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      status: "BAD_REQUEST",
      message: "id is required",
    });
  }

  const url = `${process.env.baseUrl_zoqq_cards}${constant.listCardHolders_AWX}?id=${id}`;
  console.log("URL:", url);

  const headers = {
    "x-api-key": process.env.x_api_key_zoqq, // Must be set in .env
    "x-product-id": process.env.x_product_id,
    "x-user-id": req.headers["x-user-id"],
    "x-request-id":
      req.headers["x-request-id"] || "211dc6c5-ad34-4534-86df-823e8a1a75ea",
    Authorization: req.headers["authorization"], // pass full Bearer token from client
    // Optional:
    // Cookie: req.headers["cookie"], // Uncomment only if required
  };

  try {
    const response = await axios.get(url, { headers });

    const obj = response.data;

    exportLog(
      "Fetch Card Holder Details AWX",
      obj ? "success" : "error",
      null,
      { url, headers },
      obj
    );

    res.status(200).json(obj);
  } catch (error) {
    console.error("Error fetching card holder details:", error?.message);

    exportLog(
      "Fetch Card Holder Details AWX",
      "catch",
      error.message,
      { url, headers },
      error?.response?.data || error
    );

    res.status(500).json({
      status: "ERROR",
      message: error?.response?.data || "Internal server error",
    });
  }
};



export const fetchCardDetailsAWX = async (req, res) => {
  const { id, authToken } = req.query;
  try {
    const url =
      process.env.VITE_AWX_baseUrl +
      "/api/v1/issuing/cards?cardholder_id=" +
      id;

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + authToken,
      // "x-on-behalf-of": accountId,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj) {
      exportLog("Get Card Details AWX", "success", null, { url, headers }, obj);
    } else {
      exportLog("Get Card Details AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Card Details AWX", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: { error } });
  }
};

export const UploadFilesAWX = async (req, res) => {
  try {
    const { authToken } = req.query;
    const file = req.file;
    if (!file) {
      exportLog("Upload File AWX", "error", null, null, {
        error: "No file provided",
      });
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: { error: "No file provided" },
      });
    }

    if (!authToken) {
      exportLog("Upload File AWX", "error", null, null, {
        error: "No authToken provided",
      });
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: { error: "No authToken provided" },
      });
    }

    // Prepare FormData for Airwallex API
    const formData = new FormData();
    formData.append("file", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const url =
      "https://files-demo.airwallex.com/api/v1/files/upload?notes=business_log";
    const headers = {
      Authorization: `Bearer ${authToken}`,
      ...formData.getHeaders(),
    };

    // Upload file to Airwallex
    const response = await axios.post(url, formData, { headers });

    const obj = response.data;
    if (obj && obj.file_id) {
      exportLog("Upload File AWX", "success", null, { url, headers }, obj);
      return res.status(200).json({ file_id: obj.file_id });
    } else {
      exportLog("Upload File AWX", "error", null, { url, headers }, obj);
      return res.status(500).json({
        status: "BAD_REQUEST",
        message: { error: "Invalid response from Airwallex" },
      });
    }
  } catch (error) {
    exportLog("Upload File AWX", "catch", null, null, { error: error.message });
    return res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const respondRFIAWX = async (req, res) => {
  const { rfiId, accountId, authToken } = req.query;
  try {
    const url = process.env.VITE_AWX_baseUrl + `/api/v1/rfis/${rfiId}/respond`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      ...(accountId && { "x-on-behalf-of": accountId }), // Conditionally include x-on-behalf-of
    };

    const body = req.body;

    const response = await axios.post(url, body, { headers });

    const obj = response.data;
    if (obj) {
      exportLog("Respond RFI AWX", "success", null, { url, headers }, obj);
    } else {
      exportLog("Respond RFI AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Respond RFI AWX", "catch", null, null, { error: error.message });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const DeleteCardholderAWX = async (req, res) => {
  const { cardholderId, authToken } = req.query;
  try {
    const url =
      process.env.VITE_AWX_baseUrl +
      `/api/v1/issuing/cardholders/${cardholderId}/delete`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.post(url, {}, { headers });

    const obj = response.data;
    if (obj) {
      exportLog(
        "Delete Cardholder AWX",
        "success",
        null,
        { url, headers },
        obj
      );
    } else {
      exportLog("Delete Cardholder AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Delete Cardholder AWX", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const InviteCardholderAWX = async (req, res) => {
  const { email, phoneNumber, cardholderId } = req.query;

  try {
    const url = process.env.base_url_cognito + "createUserAdmin";

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const body = {
      email,
      phoneNumber: ``,
      clientId: process.env.cognito_client_id,
      userPoolId: process.env.cognito_pool_id,
    };

    const response = await axios.post(url, body, { headers });

    const obj = response.data;
    if (obj) {
      exportLog(
        "Create Cardholder Cognito User",
        "success",
        null,
        { url, headers, body },
        obj
      );

      let b = await UpdateCognitoAttributes(email, cardholderId);
      console.log(b);
    } else {
      exportLog(
        "Create Cardholder Cognito User",
        "error",
        null,
        { url, headers, body },
        obj
      );
    }

    res.status(200).json(obj);
  } catch (error) {
    exportLog("Create Cardholder Cognito User", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const CardDetailsAWX = async (req, res) => {
  const { id } = req.query;
  try {
    // const url=process.env.VITE_AWX_baseUrl + `/api/v1/issuing/cards/${id}/details`;
    const url = `${process.env.baseUrl_zoqq_cards}${constant.awx_cardurl}?id=${id}`;
    console.log("url: ", url);
    const headers = {
      // "Content-Type": "application/json",
      // Authorization: `Bearer ${authToken}`,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-product-id": process.env.x_product_id,
      "x-user-id": req.headers["x-user-id"],
      "x-request-id":
        req.headers["x-request-id"] || "211dc6c5-ad34-4534-86df-823e8a1a75ea",
    };

    const response = await axios.get(url, { headers });

    const obj = response.data;
    if (obj) {
      exportLog("Card details AWX", "success", null, { url, headers }, obj);
    } else {
      exportLog("Card details AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Card details AWX", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const CardInfoAWX = async (req, res) => {
  const { cardId, authToken } = req.query;
  try {
    const url =
      process.env.VITE_AWX_baseUrl + `/api/v1/issuing/cards/${cardId}`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.get(url, { headers });

    const obj = response.data;
    if (obj) {
      exportLog("Card Info AWX", "success", null, { url, headers }, obj);
    } else {
      exportLog("Card Info AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Card Info AWX", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const CardUpdateAWX = async (req, res) => {
  const { cardId, authToken } = req.query;
  try {
    const url =
      process.env.VITE_AWX_baseUrl + `/api/v1/issuing/cards/${cardId}/update`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const body = req.body;

    const response = await axios.post(url, body, { headers });

    const obj = response.data;
    if (obj) {
      exportLog("Card Update AWX", "success", null, { url, headers }, obj);
    } else {
      exportLog("Card Update AWX", "error", null, { url, headers }, obj);
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Card Update AWX", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const UpdateCognitoAttributes = async (email, cardholderId) => {
  try {
    const url = process.env.base_url_cognito + "adminUpdateUserAttributes";
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
    };

    const customAttr = {};

    if (cardholderId) {
      customAttr["custom:adminflag"] = "CARDHOLDER";
      customAttr["custom:userType"] = cardholderId;
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

    return response.data;
  } catch (error) {
    exportLog("Update Cognito User Attribute", "catch", null, null, null);

    return { status: "BAD_REQUEST", message: error.message };
  }
};

export const ListBatchTransfers = async (req, res) => {
  const { authToken, accountId } = req.query;
  try {
    const url = process.env.VITE_AWX_baseUrl + `/api/v1/batch_transfers`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
      "x-on-behalf-of": accountId,
    };

    const response = await axios.get(url, { headers });
    const obj = response.data;

    exportLog(
      "List Batch Transfers",
      obj ? "success" : "error",
      null,
      { url, headers },
      obj
    );
    res.status(200).json(obj);
  } catch (error) {
    exportLog("List Batch Transfers", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const GetBatchTransferDetails = async (req, res) => {
  const { batchId, authToken } = req.query;
  try {
    const url =
      process.env.VITE_AWX_baseUrl + `/api/v1/batch_transfers/${batchId}`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.get(url, { headers });
    const obj = response.data;

    exportLog(
      "Batch Transfer Details",
      obj ? "success" : "error",
      null,
      { url, headers },
      obj
    );
    res.status(200).json(obj);
  } catch (error) {
    exportLog("Batch Transfer Details", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const GetBatchTransferItems = async (req, res) => {
  const { batchId, authToken } = req.query;
  try {
    const url =
      process.env.VITE_AWX_baseUrl + `/api/v1/batch_transfers/${batchId}/items`;
    const headers = {
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.get(url, { headers });
    const obj = response.data;

    exportLog(
      "Batch Transfer Items",
      obj ? "success" : "error",
      null,
      { url, headers },
      obj
    );
    res.status(200).json(obj);
  } catch (error) {
    exportLog("Batch Transfer Items", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const CreateBatchTransferAWX = async (req, res) => {
  const { authToken } = req.query;
  const body = req.body;

  try {
    const url = process.env.VITE_AWX_baseUrl + `/api/v1/batch_transfers/create`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.post(url, body, { headers });
    const obj = response.data;

    exportLog(
      "Create Batch Transfer",
      obj ? "success" : "error",
      null,
      { url, headers, body },
      obj
    );
    res.status(200).json(obj);
  } catch (error) {
    exportLog("Create Batch Transfer", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const AddItemsToBatchTransferAWX = async (req, res) => {
  const { batchTransferId, authToken } = req.query;
  const body = req.body;

  try {
    const url = `${process.env.VITE_AWX_baseUrl}/api/v1/batch_transfers/${batchTransferId}/add_items`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.post(url, body, { headers });
    const obj = response.data;

    exportLog(
      "Add Items to Batch Transfer",
      obj ? "success" : "error",
      null,
      { url, headers, body },
      obj
    );
    res.status(200).json(obj);
  } catch (error) {
    exportLog("Add Items to Batch Transfer", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const DeleteItemsFromBatchTransferAWX = async (req, res) => {
  const { batchTransferId, authToken } = req.query;
  const body = req.body;

  try {
    const url = `${process.env.VITE_AWX_baseUrl}/api/v1/batch_transfers/${batchTransferId}/delete_items`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.post(url, body, { headers });
    const obj = response.data;

    exportLog(
      "Delete Items from Batch Transfer",
      obj ? "success" : "error",
      null,
      { url, headers, body },
      obj
    );
    res.status(200).json(obj);
  } catch (error) {
    exportLog("Delete Items from Batch Transfer", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const GetBatchTransferQuoteAWX = async (req, res) => {
  const { batchTransferId, authToken } = req.query;

  try {
    const url = `${process.env.VITE_AWX_baseUrl}/api/v1/batch_transfers/${batchTransferId}/quote`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.post(url, {}, { headers });
    const obj = response.data;

    exportLog(
      "Get Batch Transfer Quote",
      obj ? "success" : "error",
      null,
      { url, headers },
      obj
    );
    res.status(200).json(obj);
  } catch (error) {
    exportLog("Get Batch Transfer Quote", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};

export const SubmitBatchTransferAWX = async (req, res) => {
  const { batchTransferId, authToken } = req.query;

  try {
    const url = `${process.env.VITE_AWX_baseUrl}/api/v1/batch_transfers/${batchTransferId}/submit`;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    const response = await axios.post(url, {}, { headers });
    const obj = response.data;

    exportLog(
      "Submit Batch Transfer",
      obj ? "success" : "error",
      null,
      { url, headers },
      obj
    );
    res.status(200).json(obj);
  } catch (error) {
    exportLog("Submit Batch Transfer", "catch", null, null, {
      error: error.message,
    });
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: { error: error.message } });
  }
};
