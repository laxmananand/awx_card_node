import axios from "axios";
import * as Constants from "../Modules/Constant.js";
import { v4 as uuidv4 } from "uuid";
const requestId = uuidv4();
const FormData = import("form-data");
const fs = import("fs");
import * as constant from "../Modules/Expensemodconstant.js";
import exportLog from "../Modules/exportLog.js";
import crypto from "crypto";

export const listbills = async (req, res) => {
  let {
    companyId,
    fromDate = null,
    toDate = null,
    offset = null,
    limit = null,
    status = null,
    customerEmail = null,
  } = req.query;

  const url = process.env.base_url + constant.billurl + "/" + companyId;
  console.log(url);
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId,
  };
  console.log(headers);

  const requestBody = {
    fromDate,
    toDate,
    offset,
    limit,
    status,
    customerEmail,
  };
  console.log(requestBody);
  try {
    const response = await axios.post(url, requestBody, { headers });
    console.log(response);
    const logMessage = response.data.bills ? "success" : "error";
    exportLog(
      "List bill fetched",
      logMessage,
      companyId,
      { url, headers, requestBody: req.body },
      response.data
    );
    if (response.data.bills && response.data.bills.length > 0) {
      // Case: Invoices found
      res.status(200).json(response.data.bills);
    } else if (response.data.message && response.data.status === "SUCCESS") {
      // Case: No invoices found
      res.status(200).json({
        status: "NOT_FOUND",
        message: response.data.message,
      });
    } else if (
      response.data.message &&
      response.data.status === "BAD_REQUEST"
    ) {
      // Case: No invoices found
      res.status(200).json({
        status: "BAD_REQUEST",
        message: response.data.message,
      });
    } else {
      // Case: Unexpected response format
      res.status(500).json({
        status: "ERROR",
        message: "Unexpected response format",
      });
    }
  } catch (error) {
    console.error(error);

    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "List bill failed with ",
      companyId,
      "catch",
      { url, headers, requestBody: requestBody },
      errorMessage
    );

    if (error.response) {
      // Case: Known error response from the server
      res.status(error.response.status).json({
        status: "ERROR",
        message: error.response.data.message || "Internal Server Error",
      });
    } else {
      // Case: Unknown error
      res.status(500).json({
        status: "ERROR",
        message: "An unknown error occurred",
      });
    }
  }
};

export const listinvoices = async (req, res) => {
  let {
    companyId,
    fromDate = null,
    toDate = null,
    offset = null,
    limit = null,
    status = null,
    customerEmail = null,
  } = req.query;

  console.log(companyId);

  const url = process.env.base_url + constant.invoiceurl + "/" + companyId;
  console.log(url);
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId,
  };
  console.log(headers);

  const requestBody = {
    fromDate,
    toDate,
    offset,
    limit,
    status,
    customerEmail,
  };
  console.log(requestBody);
  try {
    const response = await axios.post(url, requestBody, { headers });
    console.log(response);

    const logMessage = response.data.invoices ? "success" : "error";
    exportLog(
      "List invoices fetched",
      logMessage,
      companyId,
      { url, headers, requestBody: requestBody },
      response.data
    );

    if (response.data.invoices && response.data.invoices.length > 0) {
      // Case: Invoices found
      res.status(200).json(response.data.invoices);
    } else if (response.data.message && response.data.status === "SUCCESS") {
      // Case: No invoices found
      res.status(200).json({
        status: "NOT_FOUND",
        message: response.data.message,
      });
    } else if (
      response.data.message &&
      response.data.status === "BAD_REQUEST"
    ) {
      // Case: No invoices found
      res.status(200).json({
        status: "BAD_REQUEST",
        message: response.data.message,
      });
    } else {
      // Case: Unexpected response format
      res.status(500).json({
        status: "ERROR",
        message: "Unexpected response format",
      });
    }
  } catch (error) {
    console.error(error);

    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "List invoices failed with ",
      companyId,
      "catch",
      { url, headers, requestBody: requestBody },
      errorMessage
    );

    if (error.response) {
      // Case: Known error response from the server
      res.status(error.response.status).json({
        status: "ERROR",
        message: error.response.data.message || "Internal Server Error",
      });
    } else {
      // Case: Unknown error
      res.status(500).json({
        status: "ERROR",
        message: "An unknown error occurred",
      });
    }
  }
};

export const docanalysis = async (req, res) => {
  try {
    const url =
      process.env.base_url_v2 + "/internal/api/v2/utilities/docanalysis";
    console.log(url);
    const { objectKey } = req.query;
    console.log(objectKey);
    const requestData = {
      Bucket: "stylopay-sandbox-ohio-dev-dump-public",
      Name: objectKey,
      queries: [
        "InvoiceNumber",
        "TotalAmount",
        "OrderNumber",
        "Address",
        "dueDate",
        "InvoiceDate",
      ],
    };
    console.log(requestData);

    const response = await axios.post(url, requestData);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    if (error.name == "AxiosError") {
      res.status(504).json([error]);
    } else {
      res
        .status(500)
        .json({ status: "Internal Server Error", message: error.message });
    }
  }
};

export const Createbill = async (req, res) => {
  console.log(req);
  const {
    id,
    companyId,
    date,
    dueDate,
    amount,
    currency,
    description,
    imgUrl,
    createdBy,
    sourceOfFund,
    recipientName,
    recipientAccountnumber,
  } = req.query;
  const url = process.env.base_url + constant.billurl;

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId,
  };

  const requestBody = {
    id: id,
    companyId: companyId,
    date: date,
    dueDate: dueDate,
    amount: amount,
    currency: currency,
    description: description,
    imgUrl: imgUrl,
    createdBy: createdBy,
    sourceOfFund: sourceOfFund,
    recipientName: recipientName,
    recipientAccountnumber: recipientAccountnumber,
  };
  console.log(requestBody);
  try {
    const response = await axios.post(url, requestBody, { headers });

    const logMessage = response.data.invoices ? "success" : "error";
    exportLog(
      "create bill called ",
      logMessage,
      companyId,
      { url, headers, requestBody: requestBody },
      response.data
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "create bill failed with ",
      companyId,
      "catch",
      { url, headers, requestBody: requestBody },
      errorMessage
    );

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const Uploadtos3 = async (req, res) => {
  try {
    const url =
      "https://api.sandbox.stylopay.com/internal/api/v2/utilities/zoqqbillupload";
    console.log(url);
    const uploadedFile = req.body;
    console.log(req.body);
    const requestBody = {
      file: uploadedFile.file,
      filename: uploadedFile.filename,
      region: process.env.region,
      bucket: process.env.bucket,
    };

    console.log(requestBody);
    console.log("body check");
    console.log(req.body); // Check if the body is received
    const headers = {
      "Content-Type": "application/json",
      timeout: 40000,
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": requestId,
    };

    const response = await axios.post(url, requestBody, { headers });
    //res.status(200).json(response.data);
    if (response.status >= 200 && response.status < 300) {
      res.status(200).json(response.data);
    } else {
      res
        .status(response.status)
        .json({ status: response.statusText, message: response.data });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

export const Createinvoice = async (req, res) => {
  console.log(req);

  const {
    id,
    customerEmail,
    customerName,
    date,
    companyId,
    dueDate,
    description,
    imgUrl,
    createdBy,
    sourceOfFund,
    itemDetails,
  } = req.query;

  console.log(itemDetails);

  const url = process.env.base_url + constant.invoiceurl;
  const requestId = Date.now(); // or another UUID gen method
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId,
  };

  const requestBody = {
    id,
    companyId,
    date,
    dueDate,
    customerEmail,
    customerName,
    description,
    imgUrl: imgUrl || "https://pdfobject.com/pdf/sample.pdf",
    createdBy,
    itemDetails,
  };

  console.log(requestBody);

  try {
    const response = await axios.post(url, requestBody, { headers });

    const logMessage = response.data ? "success" : "error";
    exportLog(
      "create invoice ",
      logMessage,
      companyId,
      { url, headers, requestBody },
      response.data
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Invoice creation failed:", error);

    const rawErrorData = error?.response?.data;
    let formattedMessage = "An error occurred";

    if (rawErrorData && typeof rawErrorData === "object") {
      const { message = "An error occurred", status } = rawErrorData;

      const details = Object.entries(rawErrorData)
        .filter(([key]) => key !== "message" && key !== "status")
        .map(([, value]) => value)
        .join(", ");

      formattedMessage = details ? `${message}: ${details}` : message;

      exportLog(
        "create invoices failed with ",
        companyId,
        "catch",
        { url, headers, requestBody },
        rawErrorData
      );

      res.status(400).json({
        status: status || "BAD_REQUEST",
        message: formattedMessage,
      });
    } else {
      exportLog(
        "create invoices failed with ",
        companyId,
        "catch",
        { url, headers, requestBody },
        rawErrorData || formattedMessage
      );

      res.status(500).json({
        status: "BAD_REQUEST",
        message: formattedMessage,
      });
    }
  }
};

export const Createinvoicedoc = async (req, res) => {
  console.log(req);

  const datatosend = req.body;
  try {
    const url = "http://127.0.0.1:5000/generate_pdf";
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": requestId,
    };

    console.log(datatosend);

    const response = await axios.post(url, datatosend, { headers });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const listcustomer = async (req, res) => {
  const { companyId } = req.query;
  console.log(companyId);
  const url =
    process.env.base_url + constant.invoiceurl + "/customer/" + companyId;
  console.log(url);
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId,
  };
  console.log(headers);
  try {
    const response = await axios.get(url, { headers });
    console.log(response);

    const logMessage = response.data ? "success" : "error";
    exportLog(
      "List customers fetched",
      logMessage,
      companyId,
      { url, headers },
      response.data
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "List customers failed with ",
      companyId,
      "catch",
      { url, headers },
      errorMessage
    );

    if (error instanceof AxiosError) {
      res
        .status(504)
        .json({ status: "ERR_BAD_RESPONSE", message: "AxiosError" });
    } else {
      res
        .status(500)
        .json({ status: "BAD_REQUEST", message: "An error occurred" });
    }
  }
};

export const Createcustomer = async (req, res) => {
  console.log(req);
  const {
    customerEmail,
    customerName,
    companyId,
    address1,
    address2,
    address3,
    address4,
  } = req.query;
  const url = process.env.base_url + constant.invoiceurl + "/customer";
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId,
  };

  const requestBody = {
    companyId: companyId,

    customerEmail: customerEmail,
    customerName: customerName,
    address1: address1,
    address2: address2,
    address3: address3,
    address4: address4,
  };
  console.log(requestBody);
  try {
    const response = await axios.post(url, requestBody, { headers });

    const logMessage = response.data ? "success" : "error";
    exportLog(
      "Create customer called",
      logMessage,
      companyId,
      { url, headers, requestBody: requestBody },
      response.data
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "Create customer failed with ",
      companyId,
      "catch",
      { url, headers, requestBody: requestBody },
      errorMessage
    );

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//Get Account Details
export const getActivatedBankAccount = async (req, res) => {
  const { currencyCode, custHashId } = req.query;
  const url = process.env.base_url + constant.accounturl + custHashId;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId,
  };

  const params = {
    currencyCode: currencyCode,
  };
  try {
    const response = await axios.get(url, { headers, params });
    console.log(response);

    const logMessage = response.data ? "success" : "error";
    exportLog(
      "Activated bank accounts fetched",
      logMessage,
      custHashId,
      { url, headers, params },
      response.data
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "tivated bank accounts fetch failed with ",
      custHashId,
      "catch",
      { url, headers, params },
      errorMessage
    );

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

//Fetch balances
export const fetchbalance = async (req, res) => {
  const { currencyCode, custHashId } = req.query;
  const url =
    process.env.base_url + constant.accounturl + "balance/" + custHashId;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId,
  };
  try {
    const params = {
      currencyCode: currencyCode,
    };

    const response = await axios.get(url, { headers });
    console.log(response);

    const logMessage = response.data ? "success" : "error";
    exportLog(
      "Fetch balance fetched",
      logMessage,
      custHashId,
      { url, headers },
      response.data
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "List invoices failed with ",
      custHashId,
      "catch",
      { url, headers },
      errorMessage
    );

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const listcards = async (req, res) => {
  const { wallethashId, customerhashId } = req.query;
  console.log(wallethashId);
  try {
    const url =
      process.env.base_url +
      constant.cardurl +
      "/" +
      customerhashId +
      "/" +
      wallethashId;
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": requestId,
    };
    console.log(headers);

    const response = await axios.get(url, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const listCards_AWX = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const awxAccountId = req.headers.awxaccountid;

    if (!authToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No auth token provided" });
    }

    const {
      card_status,
      cardholder_id,
      from_created_at,
      nick_name,
      page_num,
      page_size,
      to_created_at,
    } = req.query;

    const url = process.env.VITE_AWX_baseUrl + constant.awx_cardurl;

    const headers = {
      "Content-Type": "application/json",
      "x-on-behalf-of": awxAccountId,
      Authorization: `${authToken}`,
    };

    const params = {};
    if (card_status) params.card_status = card_status;
    if (cardholder_id) params.cardholder_id = cardholder_id;
    if (from_created_at) params.from_created_at = from_created_at;
    if (nick_name) params.nick_name = nick_name;
    if (page_num) params.page_num = page_num;
    if (page_size) params.page_size = page_size;
    if (to_created_at) params.to_created_at = to_created_at;

    const response = await axios.get(url, { headers, params });

    return res.status(200).json(response.data.items);
  } catch (error) {
    console.error("AWX Card List Error:", error.message || error);
    return res.status(500).json({
      status: "BAD_REQUEST",
      message: "An error occurred while listing AWX cards.",
    });
  }
};

export const getcardsensitavedata_awx = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const awxAccountId = req.headers.awxaccountid;

    if (!authToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No auth token provided" });
    }

    const { card_id } = req.query;

    const url = `${process.env.VITE_AWX_baseUrl}${constant.fetchsensitivedata}/${card_id}/details`;

    const headers = {
      "Content-Type": "application/json",
      "x-on-behalf-of": awxAccountId,
      Authorization: `${authToken}`,
    };
    const response = await axios.get(url, { headers });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("AWX Card data:", error.message || error);
    return res.status(500).json({
      status: "BAD_REQUEST",
      message: "An error occurred while fetching AWX card data.",
    });
  }
};

export const getcarddata_awx = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const awxAccountId = req.headers.awxaccountid;

    if (!authToken) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No auth token provided" });
    }

    const { card_id } = req.query;

    const url = `${process.env.VITE_AWX_baseUrl}${constant.fetchsensitivedata}/${card_id}`;

    const headers = {
      "Content-Type": "application/json",
      "x-on-behalf-of": awxAccountId,
      Authorization: `${authToken}`,
    };
    const response = await axios.get(url, { headers });
    if (response?.status === 200) {
      return res.status(200).json(response?.data);
    }
    return response?.data;
  } catch (error) {
    console.error("AWX Card data:", error.message || error);
    return res.status(500).json({
      status: "BAD_REQUEST",
      message: "An error occurred while fetching AWX card data.",
    });
  }
};

export const addVirtualCard_awx = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const awxAccountId = req.headers.awxaccountid;
    const url = process.env.VITE_AWX_baseUrl + constant.addcard_awx;
    const payload = req.body;

    const headers = {
      "Content-Type": "application/json",
      "x-on-behalf-of": awxAccountId,
      Authorization: `${authToken}`,
    };
    const response = await axios.post(url, payload, { headers });
    if (response.status === 202) {
      res.status(200).json(response.data);
    }
    // if(response.status === 401 && response.data.code === "unauthorized")
    // {

    // }
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create card",
      error: error.message,
    });
  }
};

export const updateCard_awx = async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const awxAccountId = req.headers.awxaccountid;
    const cardId = req.params.card_id;
    const url = `${process.env.VITE_AWX_baseUrl}${constant.updateCard_awx}/${cardId}/update`;
    const payload = req.body;

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${authToken}`,
      "x-on-behalf-of": awxAccountId,
    };
    const response = await axios.post(url, payload, { headers });
    if (response?.status === 200) {
      res.status(200).json(response?.data);
    }
    // if(response.status === 401 && response.data.code === "unauthorized")
    // {

    // }
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update card",
      error: error.message,
    });
  }
};

export const temporaryBlockcards = async (req, res) => {
  const { wallethashId, customerhashId, cardhashId } = req.body; // Use req.body if sent in POST body
  console.log("Received Parameters:", {
    wallethashId,
    customerhashId,
    cardhashId,
  });

  if (!wallethashId || !customerhashId || !cardhashId) {
    return res
      .status(400)
      .json({ status: "BAD_REQUEST", message: "Missing required parameters" });
  }

  const url = `${process.env.base_url}${constant.cardurl}/lockunlock/${customerhashId}/${wallethashId}/${cardhashId}`;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId, // Ensure `requestId` is defined
  };

  try {
    const requestBody = { action: "lock" };
    const response = await axios.post(url, requestBody, { headers });

    console.log("Response received:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error during API call:", error.message);

    res.status(500).json({
      status: "BAD_REQUEST",
      message: "An error occurred while processing the request.",
    });
  }
};

export const permanentBlockcards = async (req, res) => {
  const { wallethashId, customerhashId, cardhashId, selectedReason } = req.body; // Use req.body if sent in POST body
  console.log("Received Parameters:", {
    wallethashId,
    customerhashId,
    cardhashId,
  });

  if (!wallethashId || !customerhashId || !cardhashId) {
    return res
      .status(400)
      .json({ status: "BAD_REQUEST", message: "Missing required parameters" });
  }

  const url = `${process.env.base_url}${constant.cardurl}/blockunblock/${customerhashId}/${wallethashId}/${cardhashId}`;
  console.log(url);
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId, // Ensure `requestId` is defined
  };

  try {
    const requestBody = {
      blockAction: "permanentBlock",
      reason: selectedReason,
    };
    console.log(requestBody);
    const response = await axios.post(url, requestBody, { headers });

    console.log("Response received:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error during API call:", error.message);

    res.status(500).json({
      status: "BAD_REQUEST",
      message: "An error occurred while processing the request.",
    });
  }
};

export const temporaryUnBlockcards = async (req, res) => {
  const { wallethashId, customerhashId, cardhashId } = req.body; // Use req.body if sent in POST body
  console.log("Received Parameters:", {
    wallethashId,
    customerhashId,
    cardhashId,
  });

  if (!wallethashId || !customerhashId || !cardhashId) {
    return res
      .status(400)
      .json({ status: "BAD_REQUEST", message: "Missing required parameters" });
  }

  const url = `${process.env.base_url}${constant.cardurl}/lockunlock/${customerhashId}/${wallethashId}/${cardhashId}`;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": requestId, // Ensure `requestId` is defined
  };

  try {
    const requestBody = { action: "unlock" };
    const response = await axios.post(url, requestBody, { headers });

    console.log("Response received:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error during API call:", error.message);

    res.status(500).json({
      status: "BAD_REQUEST",
      message: "An error occurred while processing the request.",
    });
  }
};

export const activeCard = async (req, res) => {
  const { wallethashId, customerhashId, cardhashId } = req.body; // Use req.body if sent in POST body
  console.log("Received Parameters:", {
    wallethashId,
    customerhashId,
    cardhashId,
  });

  if (!wallethashId || !customerhashId || !cardhashId) {
    return res
      .status(400)
      .json({ status: "BAD_REQUEST", message: "Missing required parameters" });
  }

  const url = `${process.env.base_url}${constant.cardurl}/activate/${customerhashId}/${wallethashId}/${cardhashId}`;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": uuidv4(),
  };

  console.log(headers);
  try {
    const response = await axios.post(url, {}, { headers });

    console.log("Response received:", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error during API call:", error.message);

    res.status(500).json({
      status: "BAD_REQUEST",
      message: "An error occurred while processing the request.",
    });
  }
};

export const getcardnumber = async (req, res) => {
  const { wallethashId, customerhashId, cardhashId } = req.query;
  console.log(wallethashId);
  try {
    const url =
      process.env.base_url +
      constant.cardurl +
      "/unmask/" +
      customerhashId +
      "/" +
      wallethashId +
      "/" +
      cardhashId;
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": requestId,
    };
    console.log(headers);

    const response = await axios.get(url, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const getcvv = async (req, res) => {
  const { wallethashId, customerhashId, cardhashId } = req.query;
  console.log(wallethashId);
  try {
    const url =
      process.env.base_url +
      constant.cardurl +
      "/cvvexp/" +
      customerhashId +
      "/" +
      wallethashId +
      "/" +
      cardhashId;
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": requestId,
    };
    console.log(headers);

    const response = await axios.get(url, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const getcardlimit = async (req, res) => {
  const { wallethashId, customerhashId, cardhashId } = req.query;
  console.log(wallethashId);
  try {
    const url =
      process.env.base_url +
      constant.cardurl +
      "/limit/" +
      customerhashId +
      "/" +
      wallethashId +
      "/" +
      cardhashId;
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": requestId,
    };
    console.log(headers);

    const response = await axios.get(url, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const Setpin = async (req, res) => {
  console.log(req);
  const { wallethashId, customerhashId, cardhashId, pin } = req.query;

  try {
    const url =
      process.env.base_url +
      constant.cardurl +
      "/pin/" +
      customerhashId +
      "/" +
      wallethashId +
      "/" +
      cardhashId;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": requestId,
    };

    const requestBody = {
      pinBlock: pin,
    };
    console.log(requestBody);

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const Addcard = async (req, res) => {
  console.log(req);
  const {
    wallethashId,
    customerhashId,
    nameOnCard,
    cardType,
    primarycardHashid,
    cardIssuanceAction,
  } = req.query;

  try {
    const url =
      process.env.base_url +
      constant.cardurl +
      "/" +
      customerhashId +
      "/" +
      wallethashId;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": requestId,
    };
    const today = new Date();

    // Add 5 years to the current date
    const cardExpiry = new Date(today);
    cardExpiry.setFullYear(today.getFullYear() + 5);

    // Format the cardExpiry date as "MMDD"
    const formattedExpiry = `${(cardExpiry.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${cardExpiry.getFullYear().toString().slice(-2)}`;

    console.log("Card Expiry Date (MMDD):", formattedExpiry);

    const requestBody = {
      cardIssuanceAction: cardIssuanceAction,
      cardFeeCurrencyCode: "USD",
      cardExpiry: formattedExpiry,
      cardType: cardType,
      childCustomerHashId: "",
      cardHashId: primarycardHashid,
      embossingLine1: nameOnCard,
      embossingLine2: nameOnCard,
      logoId: constant.logoId,
      plasticId: constant.plasticId,
      issuanceMode: constant.issuanceMode,
    };
    console.log(requestBody);

    const response = await axios.post(url, requestBody, { headers });
    console.log(response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
    res.status(400).json(error.data);
  }
};

export const setCardlimit = async (req, res) => {
  console.log(req.query); // Log query parameters
  const {
    cardHashId,
    walletHashid,
    customerHashId,
    enterDailyLimit,
    enterMonthlyLimit,
    enterTransactionPerLimit,
  } = req.query;

  console.log("Received data:", cardHashId, walletHashid, customerHashId);

  try {
    const url =
      process.env.base_url +
      constant.cardurl +
      "/limit/" +
      customerHashId +
      "/" +
      walletHashid +
      "/" +
      cardHashId;
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": uuidv4(),
    };

    const requestBody = {
      transactionLimits: [
        {
          type: "PER_TRANSACTION_AMOUNT_LIMIT",
          value: enterTransactionPerLimit,
          status: "Active",
        },
        {
          type: "DAILY_AMOUNT_LIMIT",
          value: enterDailyLimit,
          status: "Active",
        },
        {
          type: "MONTHLY_AMOUNT_LIMIT",
          value: enterMonthlyLimit,
          status: "Active",
        },
      ],
    };
    console.log(requestBody);

    const response = await axios.post(url, requestBody, { headers });
    console.log(response.data);

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
    res.status(400).json(error.data);
  }
};

export const sendInvoice = async (req, res) => {
  const url = process.env.mail_base_url + "/send_mail";
  const headers = {
    "Content-Type": "application/json",
  };

  const requestBody = {
    to: req.body.to,
    pdf_content: req.body.pdf_content,
    pdf_filename: req.body.pdf_filename,
    plain_text_content: req.body.plain_text_content,
    subject: req.body.subject,
    productName: "ZOQQ",
    username: "user",
    sender_email: process.env.sender_mail_id,
  };
  console.log(requestBody);
  try {
    const response = await axios.post(url, requestBody, { headers });

    const logMessage = response.data ? "success" : "error";
    exportLog(
      "send invoices called",
      logMessage,
      { url, headers, requestBody: requestBody },
      response.data
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "send invoices failed",
      "catch",
      { url, headers, requestBody: requestBody },
      errorMessage
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const updatebills = async (req, res) => {
  try {
    const requestBody = req.body;
    const url = `${process.env.base_url}${constant.updateBill}`;
    const headers = {
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-client-id": process.env.x_client_id,
      "x-request-id": crypto.randomUUID(),
      "x-client-name": process.env.x_client_name,
      "Content-Type": "application/json",
    };
    const response = await axios.patch(url, requestBody, { headers });
    exportLog("update bill", "success");
    res.status(200).json(response.data);
  } catch (err) {
    exportLog("update bill", "catch", { url, headers }, err.response.data);
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const addVirtualCard = async (req, res) => {
  const { wallethashId, customerhashId, contactName } = req.query;

  try {
    const url = `${process.env.base_url}${constant.cardurlv3}/${customerhashId}/${wallethashId}`;
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-client-name": process.env.x_client_name,
      "x-client-id": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
      "x-request-id": crypto.randomUUID(),
    };
    console.log(headers);

    // Add 5 years to the current date and format as "MMYY"
    const cardExpiry = new Date();
    cardExpiry.setFullYear(cardExpiry.getFullYear() + 5);
    const formattedExpiry = `${(cardExpiry.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${cardExpiry.getFullYear().toString().slice(-2)}`;

    console.log("Card Expiry Date (MMYY):", formattedExpiry);

    const requestBody = {
      cardExpiry: formattedExpiry,
      cardType: "VIR",
      nameOnCard: contactName,
    };
    console.log(requestBody);

    const response = await axios.post(url, requestBody, { headers });
    console.log("addvirtual", response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "BAD_REQUEST",
      message: "An error occurred",
      error: error.message,
    });
  }
};

export const CreatePhysicalCard = async (req, res) => {
  console.log(req);
  const {
    cardHolderName,
    Address1,
    Address2,
    City,
    State,
    postalCode,
    Country,
    modeofDelivery,
    walletHashid,
    customerHashId,
    contactName,
    email,
  } = req.query;

  const url = `${process.env.base_url}${constant.cardurlv3}/${customerHashId}/${walletHashid}`;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": process.env.x_api_key,
    "x-client-name": process.env.x_client_name,
    "x-client-id": process.env.x_client_id,
    "x-program-id": process.env.x_program_id,
    "x-request-id": crypto.randomUUID(),
  };

  const requestBody = {
    cardType: "PHY",
    delivery: {
      addressLine1: Address1,
      addressLine2: Address2,
      city: City,
      country: Country,
      postCode: postalCode,
      state: State,
    },
    nameOnCard: cardHolderName,
    issuanceMode: modeofDelivery,
  };

  console.log(requestBody);

  try {
    const response = await axios.post(url, requestBody, { headers });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const fetchCardToken = async (req, res) => {
  const { cardId, accountId, authToken } = req.body.params;

  const url = `${process.env.VITE_AWX_baseUrl}/api/v1/issuing/pantokens/create`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
    "x-on-behalf-of": accountId,
    "X-Frame-Options": "sameorigin",
  };

  const requestBody = {
    card_id: cardId,
  };

  console.log(requestBody);

  try {
    const response = await axios.post(url, requestBody, { headers });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};
