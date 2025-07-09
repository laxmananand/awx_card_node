import axios, { AxiosError } from "axios";
import * as Constants from "../Modules/AccountModuleConstants.js";
import crypto from "crypto";

const currentDate = new Date();

const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
const day = String(currentDate.getDate()).padStart(2, "0");
const hours = String(currentDate.getHours()).padStart(2, "0");
const minutes = String(currentDate.getMinutes()).padStart(2, "0");
const seconds = String(currentDate.getSeconds()).padStart(2, "0");

const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

const exportLog = (message, type, email, request, response) => {
  if (type === "success") {
    console.log(`${formattedDate} : ${message} successful : ${email}.`);
  } else if (type === "error") {
    console.log(
      `${formattedDate} : ${message} failed: ${email}. Request: ${JSON.stringify(request)}. Response: ${JSON.stringify(
        response
      )}`
    );
  } else if (type === "catch") {
    console.log(`${formattedDate} : ${message} failed. Response: Something went wrong at ${message} function.`);
  }
};

//Get exchange rate API
export const getExchangeRate = async (req, res) => {
  const { convertAmount, convertCurrency, destinationCurrency, platform, userId, authToken } = req.query;
  try {
    let url = "";
    let headers = "";
    let requestBody = "";

   if(platform === "awx"){
     url = process.env.baseUrl_ExchangeRate + Constants.getExchangeRateAwx;
     headers = {
      "Content-Type": "application/json",
          "x-api-key": process.env.x_api_key,
          "x-request-id": crypto.randomUUID(),
          "x-client-id": process.env.x_client_id,
          "x-client-name": process.env.x_client_name,
          "x-program-id": Constants.productCodeAwx,
          "x-user-id": userId,
          "Authorization": "Bearer " + authToken
    };
    requestBody = {
      quoteType:"conversion",
      lockPeriod:"15_mins",
      conversionSchedule:"immediate",
      sourceCurrencyCode: convertCurrency,
      destinationCurrencyCode: destinationCurrency,
      destinationAmount:"",
      sourceAmount: convertAmount,
    };
   } 
   else{
     url = process.env.base_url + Constants.getExchangeRate;
     headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name": process.env.x_client_name,
      "x-program-id": process.env.x_program_id
    };
    requestBody = {
      sourceAmount: convertAmount,
      sourceCurrencyCode: convertCurrency,
      destinationCurrencyCode: destinationCurrency
    };
  }

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
    console.log("Rate Response :" + response)

    let obj = response.data;
    if (obj?.length > 0 && 'quoteId' in obj) {
      exportLog(
        "Get Exchange Rate",
        "success",
        { url: url, requestBody: requestBody, headers: headers },
        obj
      );
    } else {
      exportLog(
        "Get Exchange Rate",
        "error",
        { url: url, requestBody: requestBody, headers: headers },
        obj
      );
    }

  } catch (error) {
    exportLog("Get Exchange Rate", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === 'BAD_REQUEST') {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    }
   else{
    res
    .status(500)
    .json({ status: "BAD_REQUEST", message: "An internal server error occurred" });
   }
  }
};

//Create Account API
export const createAccount = async (req, res) => {
  const { bankName, currencyCode, label, custHashId, platform, authToken, depositCurrency } = req.query;

  try {
    let url = "";
    let headers = {};
    let requestBody = {};

    if(platform === "awx")
    {
      url  = process.env.baseUrl_Account + Constants.getActivatedBankAccountAwx;
      headers = {
          "Content-Type": "application/json",
          "x-api-key": process.env.x_api_key,
          "x-request-id": crypto.randomUUID(),
          "x-client-id": process.env.x_client_id,
          "x-client-name": process.env.x_client_name,
          "x-product-id": Constants.productCodeAwx,
          "x-user-id": custHashId,
          "Authorization": "Bearer " + authToken
        };
      if(currencyCode === "IDR"){
        requestBody = {
        type: "global_accounts",
        country: currencyCode?.substring(0, 2) || "", // or currencyCode[0]
        currency: currencyCode,
        label: label,
        deposit_conversion_currency: depositCurrency,
        required_features: [
          {
              currency: currencyCode,
              transfer_method: "LOCAL"
          }
      ],
      };
      }
      else{
      requestBody = {
        type: "global_accounts",
        country: currencyCode?.substring(0, 2) || "", // or currencyCode[0]
        currency: currencyCode,
        label: label,
        required_features: [
          {
              currency: currencyCode,
              transfer_method: "LOCAL"
          }
      ],
      };
    }
    }
    else{
      url = process.env.base_url + Constants.createAccount + custHashId;
      headers = {
        "Content-Type": "application/json",
        "x-api-key": process.env.x_api_key_zoqq,
        "x-request-id": crypto.randomUUID(),
        "x-client-id": process.env.x_client_id,
        "x-client-name":process.env.x_client_name,
        "x-program-id": process.env.x_program_id
      };
      requestBody = {
        currencyCode: currencyCode,
        bankName: bankName,
        label: label
      };
    }

    const response = await axios.post(url, requestBody, { headers });
    console.log("Create Account Response:", response)
    res.status(200).json(response.data);

    let obj = response.data;
    
    if (('uniquePaymentId' in obj)||(obj?.status=== "success")){
      exportLog(
        "Create Account Using Business Id",
        "success",
        { url: url, requestBody: requestBody, headers: headers, businessId: custHashId },
        obj
      );
    } else {
      exportLog(
        "Create Account Using Business Id",
        "error",
        { url: url, requestBody: requestBody, headers: headers, businessId: custHashId },
        obj
      );
    }

  } catch (error) {
    exportLog("Create Account Using Business Id", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === 'BAD_REQUEST') {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    }
   else{
    res
    .status(500)
    .json({ status: "BAD_REQUEST", message: "An internal server error occurred" });
   }
  }
};

//Bank Name Dropdown
export const bankNames = async (req, res) => {
  const { currencyCode, platform } = req.query;
  try {
    const url = process.env.base_url + Constants.getBankNames ;
    
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name":process.env.x_client_name,
      "x-program-id": process.env.x_program_id
    };

    const params = {
      currencyCode: currencyCode
    };

    const response = await axios.get(url, { headers, params });
    res.status(200).json(response.data);

  let obj = response.data;
    if (obj?.length > 0) {
      exportLog(
        "Get Bank Name List for create account",
        "success",
        { url: url, params: params, headers: headers },
        obj
      );
    } else {
      exportLog(
        "Get Bank Name List for create account",
        "error",
        { url: url, params: params, headers: headers },
        obj
      );
    }

  } catch (error) {
    exportLog("Get Bank Name List for create account", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === 'BAD_REQUEST') {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    }
   else{
    res
    .status(500)
    .json({ status: "BAD_REQUEST", message: "An internal server error occurred" });
   }
  }
};

//Get Trnsaction History
export const getTransactionHistory = async (req, res) => {
  const { page, size, startDate, endDate, transactionType, systemReferenceNumber, custHashId, platform, authToken, accountId } = req.query;
  try {
    let url = "", headers = {}, response = null, requestBody = null;

    if (platform === "awx") {   
      //TXN History based on transaction type

      // for Conversion 
      if(transactionType === "Wallet_Fund_Transfer"){
      url = process.env.baseUrl_ExchangeRate + Constants.conversionListAwx;
      headers = {
         "Content-Type": "application/json",
         "x-api-key": process.env.x_api_key,
         "x-request-id": crypto.randomUUID(),
         "x-client-id": process.env.x_client_id,
         "x-client-name": process.env.x_client_name,
         "x-program-id": Constants.productCodeAwx,
         "x-user-id": custHashId,
         "Authorization": "Bearer " + authToken
     };
     const params = {
      page: 0,
      size: 10
     }
      response = await axios.get(url, { headers, params });
    }

    // for Deposits
    else if(transactionType === "Deposits"){
      url = process.env.baseUrl_Account + Constants.getTransactionHistoryAwx;
      headers = {
         "Content-Type": "application/json",
         "x-api-key": process.env.x_api_key,
         "x-request-id": crypto.randomUUID(),
         "x-client-id": process.env.x_client_id,
         "x-client-name": process.env.x_client_name,
         "x-product-id": Constants.productCodeAwx,
         "x-user-id": custHashId,
         "Authorization": "Bearer " + authToken,
         "x-account-id": accountId
     };
      response = await axios.get(url, { headers });
    }

    // for Payouts
    else if(transactionType === "Payouts"){
      url = process.env.baseUrl_ExchangeRate + Constants.conversionListAwx;
      headers = {
         "Content-Type": "application/json",
         "x-api-key": process.env.x_api_key,
         "x-request-id": crypto.randomUUID(),
         "x-client-id": process.env.x_client_id,
         "x-client-name": process.env.x_client_name,
         "x-program-id": Constants.productCodeAwx,
         "x-user-id": custHashId,
         "Authorization": "Bearer " + authToken
     };
      response = await axios.get(url, { headers });
    }

    // for all transactions
    else{
      url = process.env.baseUrl_Account + Constants.balanceHistoryAWX;
      headers = {
         "Content-Type": "application/json",
         "x-api-key": process.env.x_api_key,
         "x-request-id": crypto.randomUUID(),
         "x-client-id": process.env.x_client_id,
         "x-client-name": process.env.x_client_name,
         "x-product-id": Constants.productCodeAwx,
         "x-user-id": custHashId,
         "Authorization": "Bearer " + authToken
     };
      response = await axios.get(url, { headers });
    }
    }

else{
     url = process.env.base_url + Constants.getTransactionHistory + custHashId;
     headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name":process.env.x_client_name,
      "x-program-id": process.env.x_program_id
    };

     requestBody = {
      page: page,
      size: size,
      startDate: startDate,
      endDate: endDate,
      transactionType: transactionType,
      systemReferenceNumber: systemReferenceNumber
    };

   response = await axios.post(url, requestBody, { headers });

  }

    res.status(200).json(response.data);

  let obj = response.data;
    if (obj?.length > 0 && 'content' in obj) {
      exportLog(
        "Transaction History List using Business Id",
        "success",
        { url: url, requestBody: requestBody, headers: headers, businessId: custHashId },
        obj
      );
    } else {
      exportLog(
        "Transaction History using Business Id",
        "error",
        { url: url, requestBody: requestBody, headers: headers, businessId: custHashId },
        obj
      );
    }

  } catch (error) {
    exportLog("Get Bank Name List for create account", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === 'BAD_REQUEST') {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    }
   else{
    res
    .status(500)
    .json({ status: "BAD_REQUEST", message: "An internal server error occurred" });
   }
  }
};

//Fetch Balance
export const getCurrenciesList = async (req, res) => {
  const { custHashId, platform, authToken } = req.query;
  try {
    let url = "";
    let headers = "";

    if(platform === "awx"){
    url = process.env.baseUrl_Account + Constants.getCurrenciesListAwx;
    headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name": process.env.x_client_name,
      "x-product-id": Constants.productCodeAwx,
      "x-user-id": custHashId,
      "Authorization": "Bearer " + authToken,
    };
    }
    else{
     url = process.env.base_url + Constants.getCurrenciesList  + custHashId;
     headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name":process.env.x_client_name,
      "x-program-id": process.env.x_program_id
    };
  }
    const response = await axios.get(url, { headers });
    if(platform === "awx"){
    res.status(200).json(response.data?.data);
    }
    else{
      res.status(200).json(response.data);
    }

  let obj = response.data;
    if (obj?.length > 0) {
      exportLog(
        "Get Account Balance and Currency List using Business Id",
        "success",
        { url: url, headers: headers, businessId: custHashId },
        obj
      );
    } else {
      exportLog(
        "Get Account Balance and Currency List using Business Id",
        "error",
        { url: url, headers: headers, businessId: custHashId },
        obj
      );
    }

  } catch (error) {
    exportLog("Get Account Balance and Currency List using Business Id", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === 'BAD_REQUEST') {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    }
   else{
    res
    .status(500)
    .json({ status: "BAD_REQUEST", message: "An internal server error occurred" });
   }
  }
};

//Get Account Details
export const getActivatedBankAccount = async (req, res) => {
  const { currencyCode, custHashId, platform, authToken } = req.query;
  try {
    let url = "";
    let headers = "";
    let params = "";

    if(platform == "awx"){
       url = process.env.baseUrl_Account + Constants.getActivatedBankAccountAwx ;
       headers = {
       "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name": process.env.x_client_name,
      "x-product-id": Constants.productCodeAwx,
      "x-user-id": custHashId,
      "Authorization": "Bearer " + authToken,
      };
      params = {
        currency: currencyCode
      };
    }
    else{
      url = process.env.base_url + Constants.getActivatedBankAccount  + custHashId;
      headers = {
       "Content-Type": "application/json",
       "x-api-key": process.env.x_api_key_zoqq,
       "x-request-id": crypto.randomUUID(),
       "x-client-id": process.env.x_client_id,
       "x-client-name":process.env.x_client_name,
       "x-program-id": process.env.x_program_id
     };
     params = {
      currencyCode: currencyCode
    };
    }

    const response = await axios.get(url, { headers, params });
    res.status(200).json(response.data);

    
    let obj = response.data;
    if (obj?.length > 0) {
      exportLog(
        "Get Activated Bank Accounts using Business Id",
        "success",
        { url: url, params: params, headers: headers, businessId: custHashId },
        obj
      );
    } else {
      exportLog(
        "Get Activated Bank Accounts using Business Id",
        "error",
        { url: url, params: params, headers: headers, businessId: custHashId },
        obj
      );
    }

  } catch (error) {
    exportLog("Get Activated Bank Accounts using Business Id", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === 'BAD_REQUEST') {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    }
   else{
    res
    .status(500)
    .json({ status: "BAD_REQUEST", message: "An internal server error occurred" });
   }
  }
};

// Amount Convert

export const amountConversion = async (req, res) => {
  const { amount, destinationAmount, destinationCurrency, sourceCurrency, customerComments, custHashId, quoteId, platform, authToken } = req.query;
  try {
    let url = "";
    let headers = "";
    let requestBody = ""

    if(platform === "awx"){
       url = process.env.baseUrl_ExchangeRate + Constants.amountConversionAwx;
       headers = {
          "Content-Type": "application/json",
          "x-api-key": process.env.x_api_key,
          "x-request-id": crypto.randomUUID(),
          "x-client-id": process.env.x_client_id,
          "x-client-name": process.env.x_client_name,
          "x-program-id": Constants.productCodeAwx,
          "x-user-id": custHashId,
          "Authorization": "Bearer " + authToken
      };
  
       requestBody = {
          quote_id: quoteId,
          source_amount: amount,
          destination_amount: destinationAmount,
          source_currency: sourceCurrency,
          destination_currency: destinationCurrency  
      };
    }
    else{
     url = process.env.base_url + Constants.amountConversion + custHashId;
     headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name":process.env.x_client_name,
      "x-program-id": process.env.x_program_id
    };

     requestBody = {
      amount: amount,
      destinationAmount: destinationAmount,
      destinationCurrency: destinationCurrency,
      sourceCurrency: sourceCurrency,
      customerComments: customerComments
    };
  }

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);

  let obj = response.data;
    if (obj?.length > 0 && 'systemReferenceNumber' in obj) {
      exportLog(
        "Amount or Currency Conversion using Business Id",
        "success",
        { url: url, requestBody: requestBody, headers: headers, businessId: custHashId },
        obj
      );
    } else {
      exportLog(
        "Amount or Currency Conversion using Business Id",
        "error",
        { url: url, requestBody: requestBody, headers: headers, businessId: custHashId },
        obj
      );
    }

  } catch (error) {
    exportLog("Amount or Currency Conversion using Business Id", "catch", null, null, null);

    if (error.isAxiosError) {
      const axiosError = error;
      if (axiosError.response && axiosError.response.data) {
        const { status, data } = axiosError.response;
        if (data.status === 'BAD_REQUEST') {
          return res.status(status).json(data);
        } else {
          return res.status(status).json(data);
        }
      }
    }
   else{
    res
    .status(500)
    .json({ status: "BAD_REQUEST", message: "An internal server error occurred" });
   }
  }
};

//Get Virtual Account Details
export const getVirtualAccount = async (req, res) => {
  const { custHashId } = req.query;

  try {
    const url = process.env.base_url_v2 + Constants.getVirtualAccount  + "890d89cff9dff144eb37bbd78121f500";
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key,
      "x-request-id": crypto.randomUUID(),
      "x-client-id": process.env.x_client_id,
      "x-client-name":process.env.x_client_name,
      "x-program-id": "SMMAAS0"
    };

    const response = await axios.get(url, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    if (error instanceof AxiosError) {
      if (error.response && error.response.data && error.response.data.status === 'BAD_REQUEST') {
        res.status(error.response.status).json(error.response.data);
      }else{
      res.status(error.response.status).json(error.response.data);
      }
    } else{
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
  }
};
