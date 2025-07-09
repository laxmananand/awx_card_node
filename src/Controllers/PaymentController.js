import axios from "axios";

import crypto from "crypto";
import * as constant from "../Modules/Paymentmodelconstant.js";
import exportLog from "../Modules/exportLog.js";
import { url } from "inspector";
import { respondTransactionRFI } from "../Modules/Constant.js";

//Add beneficiries
export const addBeneficiry = async (req, res) => {
  const { customerHashId } = req.params;

  const url = `${process.env.base_url}${constant.addBeneficirypath}${customerHashId}`;
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
  };
  try {
    const response = await axios.post(url, req.body, { headers });

    const logMessage = response.data?.beneficiaryHashId ? "success" : "error";

    exportLog(
      "addBeneficiry using customerHashId",
      customerHashId,
      logMessage,
      { url, headers, requestBody: req.body },
      response
    );

    res.status(200).json(response?.data);
  } catch (error) {
    console.error(error);
    const errorMessage = error.response
      ? error.response.data
      : "An error occurred";
    exportLog(
      "addBeneficiry using customerHashId",
      customerHashId,
      "catch",
      { url, headers, requestBody: req.body },
      errorMessage
    );
    res.status(500).json({ status: "BAD_REQUEST", message: errorMessage });
  }
};

// awx beneficiary creation

// export const addBeneficiaryawx = async (req, res) => {
//   // const { customerHashId } = req.params;
//   console.log(req.body);
//   const url = `${process.env.VITE_AWX_baseUrl}${constant.addBeneficirypath_awx}`;
//   const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiY2xpZW50IiwiZGMiOiJISyIsImRhdGFfY2VudGVyX3JlZ2lvbiI6IkhLIiwiaXNzZGMiOiJVUyIsImp0aSI6IjI0NTk5Zjc2LTliZWQtNDY0NC04NWMyLTdlZTU0ZDkwMTVjMCIsInN1YiI6ImE1MzI1YzU2LWZhOTAtNDFkMy04YmFmLTQ5NDllYjVlNzc2MCIsImlhdCI6MTc0NDcyMjU4MywiZXhwIjoxNzQ0NzI0MzgzLCJhY2NvdW50X2lkIjoiNzViMjBjNzgtMjJmYy00ZTAwLWFlOGYtNmEwNTc3MDlhZmFjIiwiYXBpX3ZlcnNpb24iOiIyMDI1LTAyLTE0IiwicGVybWlzc2lvbnMiOlsicjphd3g6KjoqIiwidzphd3g6KjoqIl19.hA_aJwnfKliCmxCFbODYAE0F74tHUvNAIuP-8_4TXQc',
//   };

//   try {
//     const response = await axios.post(url, req.body, { headers });

//     const logMessage = response.data?.id ? "success" : "error";

//     exportLog(
//       "addBeneficiaryawx",
//        logMessage,
//       { url, headers, requestBody: req.body },
//       response
//     );

//     res.status(200).json(response?.data);
//   } catch (error) {
//     console.error("Error creating beneficiary:", error);
//     const errorMessage = error.response
//       ? error.response.data
//       : "An error occurred";
//     exportLog(
//       "addBeneficiry_awx",
//       // customerHashId,
//       "catch",
//       { url, headers, requestBody: req.body },
//       errorMessage
//     );
//     res.status(500).json({ status: "BAD_REQUEST", message: errorMessage });
//   }
// };

//List Beneficiries

export const listBeneficiries = async (req, res) => {
  let beneficiarylist;
  const { customerHashId } = req.params;
  const url =
    process.env.base_url + constant.listbeneficiarypath + customerHashId;
  console.log(url);
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
  };
  try {
    console.log(headers);
    const response = await axios.get(url, { headers });
    // if (response.data.length > 0) {
    beneficiarylist = response?.data;
    // }
    exportLog(
      "listbeneficiary using customerHashId",
      customerHashId,
      "success"
    );
    res.status(200).json(beneficiarylist);
  } catch (error) {
    exportLog(
      "listbeneficiary using customerHashId",
      customerHashId,
      "error",
      { url, headers },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const fetchDetails = async (req, res) => {
  const { beneficiaryHashId } = req.params;
  const { customerHashId } = req.params;
  const url =
    process.env.base_url +
    constant.fetchbeneficiarydetailspath +
    customerHashId +
    "/" +
    beneficiaryHashId;
  console.log(url);
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
  };
  try {
    console.log(headers);
    const response = await axios.get(url, { headers });
    exportLog(
      "fetchDetails using customerHashId & beneficiaryHashId",
      "success",
      customerHashId + ", " + beneficiaryHashId
    );
    res.status(200).json(response?.data);
  } catch (error) {
    exportLog(
      "fetchDetails using customerHashId & beneficiaryHashId",
      "error",
      customerHashId + ", " + beneficiaryHashId,
      { url, headers },
      error.response.data
    );
    console.error(error);
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};
// delete beneficiary
export const deleteBeneficiary = async (req, res) => {
  const { beneficiaryHashId } = req.params;
  const { customerHashId } = req.params;
  const url =
    process.env.base_url +
    constant.fetchbeneficiarydetailspath +
    customerHashId +
    "/" +
    beneficiaryHashId;
  console.log(url);
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
  };
  try {
    console.log(headers);
    const response = await axios.delete(url, { headers });
    exportLog(
      "deleteBeneficiary using customerHashId & beneficiaryHashId",
      "success",
      customerHashId + ", " + beneficiaryHashId
    );

    res.status(200).json(response?.data);
  } catch (error) {
    exportLog(
      "deleteBeneficiary using customerHashId & beneficiaryHashId",
      "error",
      customerHashId + ", " + beneficiaryHashId,
      { url, headers },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

// currency list

export const listCurrency = async (req, res) => {
  const { customerHashId } = req.params;
  const url =
    process.env.base_url + constant.fetchaccountbalance + customerHashId;
  console.log(url);
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.get(url, { headers });
    exportLog("listCurrency using customerHashId", "success", customerHashId);
    res.status(200).json(response?.data);
  } catch (error) {
    exportLog(
      "listCurrency using customerHashId ",
      "error",
      customerHashId,
      { url, headers },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const sendMoney = async (req, res) => {
  const { customerHashId } = req.params;
  const requestBody = req.body;
  console.log(requestBody);
  const url = process.env.base_url + constant.sendmoneypath + customerHashId;
  console.log(url);
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.post(url, requestBody, { headers });
    // if(response.data?.system_reference_number !== undefined){
    // if(response.data.status !== "BAD_REQUEST"){
    exportLog("sendMoney using customerHashId", "success", customerHashId);
    // }

    res.status(200).json(response?.data);
  } catch (error) {
    exportLog(
      "sendMoney using customerHashId ",
      "catch",
      customerHashId,
      { url, headers, requestBody },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: error.response.data });
  }
};

// Function to encrypt data using crypto-js
// const encryptQueryParams = (params) => {
//   const secretKey = process.env.secretKey; // Use your key from env or a default one
//   return cryptoJs.AES.encrypt(params, secretKey).toString(); // Encrypts query params using AES encryption
// };

export const fetchCorridors = async (req, res) => {
  // const secretKey = cryptoJs.lib.WordArray.random(32).toString(); // 32 bytes = 256 bits

  const { base_url, x_program_id, x_api_key_zoqq, x_client_id, x_client_name } =
    process.env;

  const queryParams = {
    beneficiaryAccountType: req.query.accounttype.toUpperCase(),
    customerType: "CORPORATE", // Required, so it's hardcoded
    destinationCountry: req.query.destinationCountry,
    destinationCurrency: req.query.destinationCurrency,
    payoutMethod: req.query.payoutMethod, // Default to LOCAL
    routingCodeType: req.query.routingCodeType, // Default to SWIFT
    page: req.query.page || 0, // Default to 0
    size: req.query.size || 0, // Default to 0
    order: req.query.order || "DESC", // Default to DESC
  };

  // Remove undefined values from queryParams
  const filteredQueryParams = Object.entries(queryParams)
    .filter(([key, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // Encrypt the query string using crypto-js
  // const encryptedQuery = encryptQueryParams(filteredQueryParams);
  const url = `${base_url}${constant.fetchCorridors_V3}?${filteredQueryParams}`;

  // Headers
  const headers = {
    "x-program-id": x_program_id,
    "x-api-key": x_api_key_zoqq,
    "x-client-id": x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": x_client_name,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(url, { headers });
    console.log(response);

    if (response.status !== "BAD_REQUEST") {
      const result = response.data.content.map(
        ({ routingCodeType, payoutMethod, beneficiaryAccountType }) => ({
          routingCodeType,
          payoutMethod,
          beneficiaryAccountType,
        })
      );
      exportLog(
        "fetchCorridors using destinationCountry & destinationCurrency",
        "success",
        `${req.query.destinationCountry}, ${req.query.destinationCurrency},${req.query.accounttype}`
      );
      res.status(200).json(result);
    } else {
      exportLog(
        "fetchCorridors using destinationCountry & destinationCurrency",
        "BAD_REQUEST",
        `${req.query.destinationCountry}, ${req.query.destinationCurrency},${req.query.accounttype}`,
        { url, headers },
        response
      );
      res.status(200).json(response?.data);
    }
  } catch (error) {
    exportLog(
      "fetchCorridors using destinationCountry & destinationCurrency",
      "BAD_REQUEST",
      `${req.query.destinationCountry}, ${req.query.destinationCurrency},${req.query.accounttype}`,
      { url, headers },
      error.response?.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const fetchCorridorsfullresponse = async (req, res) => {
  // const secretKey = cryptoJs.lib.WordArray.random(32).toString(); // 32 bytes = 256 bits

  const { base_url, x_program_id, x_api_key_zoqq, x_client_id, x_client_name } =
    process.env;

  const queryParams = {
    beneficiaryAccountType: req.query.beneficiaryAccountType.toUpperCase(),
    customerType: "CORPORATE", // Required, so it's hardcoded
    destinationCountry: req.query.destinationCountry,
    destinationCurrency: req.query.destinationCurrency,
    payoutMethod: req.query.payoutMethod, // Default to LOCAL
    routingCodeType: req.query.routingCodeType, // Default to SWIFT
    page: req.query.page || 0, // Default to 0
    size: req.query.size || 0, // Default to 0
    order: req.query.order || "DESC", // Default to DESC
  };

  // Remove undefined values from queryParams
  const filteredQueryParams = Object.entries(queryParams)
    .filter(([key, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  // Encrypt the query string using crypto-js
  // const encryptedQuery = encryptQueryParams(filteredQueryParams);
  const url = `${base_url}${constant.fetchCorridors_V3}?${filteredQueryParams}`;

  // Headers
  const headers = {
    "x-program-id": x_program_id,
    "x-api-key": x_api_key_zoqq,
    "x-client-id": x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": x_client_name,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(url, { headers });
    console.log(response);

    if (response.status !== "BAD_REQUEST") {
      const result = response.data.content;
      exportLog(
        "fetchCorridors using destinationCountry & destinationCurrency",
        "success",
        `${req.query.destinationCountry}, ${req.query.destinationCurrency},${req.query.accounttype}`
      );
      res.status(200).json(result);
    } else {
      exportLog(
        "fetchCorridors using destinationCountry & destinationCurrency",
        "BAD_REQUEST",
        `${req.query.destinationCountry}, ${req.query.destinationCurrency},${req.query.accounttype}`,
        { url, headers },
        response
      );
      res.status(200).json(response?.data);
    }
  } catch (error) {
    exportLog(
      "fetchCorridors using destinationCountry & destinationCurrency",
      "BAD_REQUEST",
      `${req.query.destinationCountry}, ${req.query.destinationCurrency},${req.query.accounttype}`,
      { url, headers },
      error.response?.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const fetchexcahngerate = async (req, res) => {
  const { customerHashId } = req.params;
  const requestBody = req.body;

  const url = `${process.env.base_url}${constant.fetchexcahngeratepath}${customerHashId}`;

  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.post(url, requestBody, { headers });

    exportLog(
      "fetchexcahngerate using customerHashId",
      "success",
      customerHashId
    );
    res.status(200).json(response.data);
  } catch (error) {
    exportLog(
      "fetchexcahngerate using customerHashId",
      "catch",
      customerHashId,
      { url, headers },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const validationschema = async (req, res) => {
  const { customerHashId } = req.params;
  const requestBody = req.body;

  const url = `${process.env.base_url}${constant.validationschemapath}${customerHashId}`;

  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.post(url, requestBody, { headers });

    exportLog(
      "validationschema using customerHashId",
      "success",
      customerHashId
    );

    res.status(200).json(response?.data);
  } catch (error) {
    exportLog(
      "validationschema using customerHashId",
      "catch",
      customerHashId,
      { url, headers },
      error.response.data
    );

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const fetchBankName = async (req, res) => {
  const requestBody = req.body;
  const url = `${process.env.base_url}${constant.fetchbankpath}`;
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.post(url, requestBody, { headers });
    exportLog("fetchBankName", "success");
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("fetchBankName", "catch", { url, headers }, error.response.data);
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const listpurposeCode = async (req, res) => {
  const url = `${process.env.base_url}${constant.listpurposeCodepath}`;
  console.log(url);

  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
  };
  try {
    console.log(headers);

    const response = await axios.get(url, { headers });

    exportLog("listpurposeCode", "success");

    const codesToRemove = ["IR019", "IR017", "REFUND"];
    const filteredData = response.data?.filter(
      (entry) => entry.purposeCode && !codesToRemove.includes(entry.purposeCode)
    );
    res.status(200).json(filteredData);
  } catch (error) {
    exportLog(
      "listpurposeCode",
      "catch",
      { url, headers },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const fetchpaymentstatus = async (req, res) => {
  const customerHashId = req.params.customerHashId;
  const requestBody = req.body;
  console.log(requestBody);
  const url =
    process.env.base_url + constant.fetchpaymentstatuspath + customerHashId;
  console.log(url);
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.post(url, requestBody, { headers });
    exportLog(
      "fetchpaymentstatus with customerHashId",
      "success",
      customerHashId
    );
    res.status(200).json(response?.data);
  } catch (error) {
    exportLog(
      "fetchpaymentstatus with customerHashId",
      "catch",
      customerHashId,
      { url, headers },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const editBeneficiary = async (req, res) => {
  const { customerHashId, beneficiaryHashId } = req.params;

  const requestBody = req.body;
  const url = `${process.env.base_url}${constant.editBeneficiarypath}${customerHashId}/${beneficiaryHashId}`;
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.put(url, requestBody, { headers });

    res.status(200).json(response?.data);
  } catch (error) {
    if (error.response && error.response.data) {
      // Forward the exact response from the API
      res.status(error.response.status || 400).json(error.response.data);
    } else {
      // Handle generic errors
      // res.status(500).json({
      //   status: "INTERNAL_SERVER_ERROR",
      //   message: "Something went wrong. Please try again later.",
      // });
      res
        .status(500)
        .json({ status: "BAD_REQUEST", message: "An error occurred" });
    }
  }
};

export const listCountrycurrency = async (req, res) => {
  const url = process.env.base_url + constant.listCountrycurrencypath;
  console.log(url);
  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
  };
  console.log(headers);
  try {
    const response = await axios.get(url, { headers });
    exportLog("listCountrycurrency ", "success", response);
    res.status(200).json(response?.data);
  } catch (error) {
    exportLog(
      "listCountrycurrency ",
      "catch",
      { url, headers },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const fetchBeneficiaryValidationSchema = async (req, res) => {
  const { customerHashId } = req.params;
  const requestBody = req.body;

  const url = `${process.env.base_url}${constant.validationschemapath}${customerHashId}`;

  const headers = {
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-client-id": process.env.x_client_id,
    "x-request-id": crypto.randomUUID(),
    "x-client-name": process.env.x_client_name,
    "Content-Type": "application/json",
  };
  try {
    const response = await axios.post(url, requestBody, { headers });

    exportLog(
      "fetchBeneficiaryValidationSchema with customerHashId",
      "success",
      customerHashId
    );
    res.status(200).json(response.data);
  } catch (error) {
    exportLog(
      "fetchBeneficiaryValidationSchema with customerHashId",
      "catch",
      customerHashId,
      { url, headers, requestBody },
      error.response.data
    );
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

// Business Transaction tag

export const businessTxnTag = async (req, res) => {
  const { txnId, businessTag, custHashId } = req.query;
  try {
    const url =
      process.env.base_url + constant.businessTxnTag + custHashId + "/" + txnId;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name": process.env.x_client_name,
      "x-program-id": process.env.x_program_id,
    };

    const requestBody = {
      businessTransaction: businessTag,
    };

    const response = await axios.put(url, requestBody, { headers });
    res.status(200).json(response.data);

    let obj = response.data;
    if (obj?.length > 0 && "status" in obj && obj.status == "OK") {
      exportLog(
        "Business transaction Tag",
        "success",
        {
          url: url,
          requestBody: requestBody,
          headers: headers,
          businessId: custHashId,
          TransactionId: txnId,
        },
        obj
      );
    } else {
      exportLog(
        "Business transaction Tag",
        "error",
        {
          url: url,
          requestBody: requestBody,
          headers: headers,
          businessId: custHashId,
          TransactionId: txnId,
        },
        obj
      );
    }
  } catch (error) {
    exportLog("Business transaction Tag", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === "BAD_REQUEST") {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    } else {
      res.status(500).json({
        status: "BAD_REQUEST",
        message: "An internal server error occurred",
      });
    }
  }
};

// upload Transaction reciept

export const uploadTxnReciept = async (req, res) => {
  const { txnId, custHashId } = req.query;
  try {
    const url =
      process.env.base_url + constant.uploadReciept + custHashId + "/" + txnId;
    const uploadedFile = req.body;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name": process.env.x_client_name,
      "x-program-id": process.env.x_program_id,
    };

    const requestBody = {
      document: uploadedFile?.document,
      receiptFileName: uploadedFile?.receiptFileName,
      receiptType: uploadedFile?.receiptType,
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);

    let obj = response.data;
    if (obj?.length > 0 && "status" in obj && obj.status == "OK") {
      exportLog(
        "Upload Transaction Reciept",
        "success",
        {
          url: url,
          requestBody: requestBody,
          headers: headers,
          businessId: custHashId,
          TransactionId: txnId,
        },
        obj
      );
    } else {
      exportLog(
        "Upload Transaction Reciept",
        "error",
        {
          url: url,
          requestBody: requestBody,
          headers: headers,
          businessId: custHashId,
          TransactionId: txnId,
        },
        obj
      );
    }
  } catch (error) {
    exportLog("Upload Transaction Reciept", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === "BAD_REQUEST") {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    } else {
      res.status(500).json({
        status: "BAD_REQUEST",
        message: "An internal server error occurred",
      });
    }
  }
};

// download Transaction reciept

export const downloadTxnReceipt = async (req, res) => {
  const { txnId, custHashId } = req.query;
  try {
    const url =
      process.env.base_url + constant.uploadReciept + custHashId + "/" + txnId;

    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name": process.env.x_client_name,
      "x-program-id": process.env.x_program_id,
    };

    const response = await axios.get(url, { headers });
    res.status(200).json(response.data);

    let obj = response.data;
    if (obj?.length > 0 && "status" in obj && obj.status == "OK") {
      exportLog(
        "Download Transaction Reciept",
        "success",
        {
          url: url,
          requestBody: requestBody,
          headers: headers,
          businessId: custHashId,
          TransactionId: txnId,
        },
        obj
      );
    } else {
      exportLog(
        "Download Transaction Reciept",
        "error",
        {
          url: url,
          requestBody: requestBody,
          headers: headers,
          businessId: custHashId,
          TransactionId: txnId,
        },
        obj
      );
    }
  } catch (error) {
    exportLog("Download Transaction Reciept", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === "BAD_REQUEST") {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    } else {
      res.status(500).json({
        status: "BAD_REQUEST",
        message: "An internal server error occurred",
      });
    }
  }
};

export const EnquireRemittanceQuote = async (req, res) => {
  const { amount, recipientType } = req.query;
  try {
    const url =
      "https://u399l5sdjj.execute-api.us-east-2.amazonaws.com/Dev/sgstlupy/v2/users/wallets/payouts/remittances/quotes";

    const headers = {
      "Content-Type": "application/json",
      "X-Auth-User-ID": "890d89cff9dff144eb37bbd78121f500",
      Authorization: "Basic e3tjb25zdW1lcktleX19Ont7c2VjcmV0UGFzc3dvcmR9fQ==",
    };

    const requestBody = {
      amount: amount,
      recipient_country: "IND",
      receiving_currency: "INR",
      recipient_type: recipientType,
      receiving_institution_type: "BANK",
      quote_type: "FORWARD",
      fees: {
        included: false,
        discount_fixed_amount: "0.00",
        discount_variable_percentage: "0.00",
        exchange_rate_markdown_variable_percentage: "0.00",
      },
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    if (error instanceof AxiosError) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.status === "BAD_REQUEST"
      ) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res.status(error.response.status).json(error.response.data);
      }
    } else {
      res
        .status(500)
        .json({ status: "BAD_REQUEST", message: "An error occurred" });
    }
  }
};

export const addBeneficiaryawx = async (req, res) => {
  const beneficiary_qwx = req.body.formData.beneficiary;
  const accountId = req.body.awxAccountId;
  const authToken = req.body.authToken;
  // const { customerHashId } = req.params;
  console.log(JSON.stringify(req.body, null, 2));
  const url = `${process.env.VITE_AWX_baseUrl}${constant.addBeneficirypath_awx}`;
  // const headers = {
  //   'Content-Type': 'application/json',
  //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoiY2xpZW50IiwiZGMiOiJISyIsImRhdGFfY2VudGVyX3JlZ2lvbiI6IkhLIiwiaXNzZGMiOiJVUyIsImp0aSI6IjI0NTk5Zjc2LTliZWQtNDY0NC04NWMyLTdlZTU0ZDkwMTVjMCIsInN1YiI6ImE1MzI1YzU2LWZhOTAtNDFkMy04YmFmLTQ5NDllYjVlNzc2MCIsImlhdCI6MTc0NDcyMjU4MywiZXhwIjoxNzQ0NzI0MzgzLCJhY2NvdW50X2lkIjoiNzViMjBjNzgtMjJmYy00ZTAwLWFlOGYtNmEwNTc3MDlhZmFjIiwiYXBpX3ZlcnNpb24iOiIyMDI1LTAyLTE0IiwicGVybWlzc2lvbnMiOlsicjphd3g6KjoqIiwidzphd3g6KjoqIl19.hA_aJwnfKliCmxCFbODYAE0F74tHUvNAIuP-8_4TXQc',
  // };

  const headers = {
    "x-on-behalf-of": accountId,
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  try {
    const response = await axios.post(url, beneficiary_qwx, { headers });

    // Success scenario
    if (response?.data?.id) {
      exportLog(
        "Add Beneficiary_AWX",
        "success",
        null,
        { url, headers, body: req.body },
        response.data
      );
      return res.status(201).json(response.data);
    }

    // Fallback in case no ID is present in successful response
    // return res.status(200).json(response.data);
  } catch (error) {
    const errRes = error?.response;

    // Handle schema validation failure
    if (errRes?.status === 400 && errRes?.data?.code === "validation_failed") {
      const errorDetails = errRes.data.details.errors.map((e) => {
        return `Field: ${e.source}, Code: ${e.code}`;
      });

      exportLog(
        "Add Beneficiary_AWX",
        "validation_failed",
        null,
        { url, headers, body: req.body },
        errRes.data
      );

      return res.status(400).json({
        status: "VALIDATION_FAILED",
        message: errRes.data.message,
        errors: errorDetails,
      });
    }

    // Generic error catch
    exportLog(
      "Add Beneficiary_AWX",
      "catch",
      null,
      { url, headers, body: req.body },
      error.message
    );

    return res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
};

// export const listBeneficeries_awx = async (req, res) => {

//   const accountId = req.body.awxAccountId;
//   const authToken = req.body.authToken;

//   const url = `${process.env.VITE_AWX_baseUrl}${constant.listBeneficeries_awx}`;

//   const headers = {
//     "x-on-behalf-of": accountId,
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${authToken}`,
//   };

//   try {

//     const response = await axios.get(url, { headers });
//     const transformed = transformAWXBeneficiary(response.data.items);

//     return res.status(200).json(transformed);
//   }

//   catch(error){
//     return res.status(500).json({
//       status: 'INTERNAL_SERVER_ERROR',
//       message: error.message,
//     });
//   }

// }

export const listBeneficiaries_awx = async (req, res) => {
  const accountId = req.body.awxAccountId; // Or use req.query if GET
  const authToken = req.body.authToken;

  const url = `${process.env.VITE_AWX_baseUrl}${constant.listBeneficeries_awx}`;

  const headers = {
    "x-on-behalf-of": accountId,
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  try {
    const response = await axios.get(url, { headers });

    const beneficiaries = response.data.items;

    // Transform each beneficiary if it's an array
    const transformed = beneficiaries.map(transformAWXBeneficiary);

    return res.status(201).json(transformed);
  } catch (error) {
    return res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      message: error.message,
    });
  }
};

export const transformAWXBeneficiary = (input) => {
  const bankDetails = input.beneficiary.bank_details;
  const address = input.beneficiary.address;

  return {
    beneficiaryHashId: input.id || null,
    beneficiaryName:
      input.beneficiary.bank_details.account_name ||
      input.beneficiary.company_name ||
      input.beneficiary.first_name ||
      null,
    beneficiaryContactCountryCode: null,
    beneficiaryContactNumber:
      input.beneficiary.additional_info?.personal_mobile_number || null,
    beneficiaryAccountType:
      input.beneficiary.entity_type === "COMPANY" ? "Business" : "Individual",
    beneficiaryEmail: input.beneficiary.additional_info?.personal_email || null,
    autosweepPayoutAccount: false,
    defaultAutosweepPayoutAccount: false,
    remitterBeneficiaryRelationship: null,
    beneficiaryAddress: address?.street_address || null,
    beneficiaryCountryCode: address?.country_code || null,
    beneficiaryState: address?.state || null,
    beneficiaryCity: address?.city || null,
    beneficiaryPostcode: address?.postcode || null,
    beneficiaryCreatedAt: new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " "), // Or fetched timestamp
    beneficiaryUpdatedAt: new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
    payoutHashId: null, // assign if exists
    destinationCountry: bankDetails?.bank_country_code || null,
    destinationCurrency: bankDetails?.account_currency || null,
    beneficiaryBankName: bankDetails?.bank_name || null,
    beneficiaryBankAccountType: null,
    beneficiaryAccountNumber: bankDetails?.account_number || null,
    beneficiaryBankCode: null,
    routingCodeType1: bankDetails?.account_routing_type1?.toUpperCase() || null,
    routingCodeValue1: bankDetails?.account_routing_value1 || null,
    routingCodeType2: bankDetails?.account_routing_type2?.toUpperCase() || null,
    routingCodeValue2: bankDetails?.account_routing_value2 || null,
    payoutMethod: input.transfer_methods?.[0]?.toUpperCase() || null,
    beneficiaryIdentificationType: null,
    beneficiaryIdentificationValue: null,
    payoutCreatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    payoutUpdatedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    beneficiaryCardType: null,
    beneficiaryCardToken: null,
    beneficiaryCardNumberMask: null,
    beneficiaryCardIssuerName: null,
    beneficiaryCardExpiryDate: null,
    beneficiaryCardMetaData: null,
    proxyType: null,
    proxyValue: null,
    convertDestinationCurrency: false,
    beneficiaryContactName:
      input.beneficiary.bank_details.account_name ||
      input.beneficiary.company_name ||
      input.beneficiary.first_name ||
      null,
    beneficiaryEntityType: input.beneficiary.entity_type || null,
    beneficiaryDob: input.beneficiary.date_of_birth || null,
    beneficiaryEstablishmentDate: null,
    accountVerification: null,
  };
};

export const sendMoney_AWX = async (req, res) => {
  // const { customerHashId } = req.params;
  const { awxAccountId, authToken, ...restBody } = req.body;
  console.log(restBody);
  const url = process.env.VITE_AWX_baseUrl + constant.sendmoneypath_awx;
  console.log(url);
  const headers = {
    "Content-Type": "application/json",
    "x-on-behalf-of": awxAccountId,
    Authorization: `Bearer ${authToken}`,
  };
    console.log("headers",headers);

  try {
    const response = await axios.post(url, restBody, { headers });
    // if(response.data?.system_reference_number !== undefined){
    // if(response.data.status !== "BAD_REQUEST"){
    exportLog("sendMoney_awx using customerHashId", "success");
    // }

    res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || "Something went wrong";
    const data = error.response?.data || {};

    exportLog(
      "sendMoney_awx using customerHashId ",
      "catch",
      { url, headers, restBody },
      error
    );

    res.status(status).json({
      status: status === 400 ? "BAD_REQUEST" : "ERROR",
      message,
      ...data,
    });
  }};
