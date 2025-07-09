import axios from "axios";
import * as Constants from "../Modules/Constant.js";
import crypto from "crypto";
import FormData from "form-data";
import exportLog from "../Modules/exportLog.js";
import { SetSessionData, FetchSessionData } from "../Modules/SetSessionData.js";
import { UpdateFailedReason } from "../Modules/UpdateValuesCheck.js";

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

/* <-- General Details Starts --> */
//Get Business List API
export const getBusinessList = async (req, res) => {
  const { region, businessRegistrationNumber } = req.query;
  try {
    const url = process.env.base_url + Constants.businessList;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-request-id": crypto.randomUUID(),
      "x-client-name": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
    };

    const requestBody = {
      countryCode: region,
      businessRegistrationNumber: businessRegistrationNumber,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.length > 0) {
      exportLog(
        "Public Corporate Details Using Business-Id",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Public Corporate Details Using Business-Id",
        "error",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog(
      "Public Corporate Details Using Business-Id",
      "catch",
      null,
      null,
      null
    );

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Get Business Details API
export const getBusinessDetails = async (req, res) => {
  const { region, businessRegistrationNumber } = req.query;
  //const clientHashID = process.env.nium_clientHashId;
  try {
    const url =
      process.env.base_url +
      "/zoqq/api/v2/onboarding/corporateDetailsByBusinessId";

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-request-id": crypto.randomUUID(),
      "x-client-name": process.env.x_client_id,
      "x-program-id": process.env.x_program_id,
    };

    const requestBody = {
      countryCode: region,
      searchReferenceId: businessRegistrationNumber,
    };

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj?.businessDetails) {
      exportLog(
        "Exhaustive Corporate Details Using Business-Id",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else if (obj?.status === "BAD_REQUEST") {
      exportLog(
        "Exhaustive Corporate Details Using Business-Id",
        "error",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog(
      "Exhaustive Corporate Details Using Business-Id",
      "catch",
      null,
      null,
      null
    );

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const getBusinessIncorporationDetails = async (req, res) => {
  const { businessRegistrationNumber } = req.query;

  try {
    const url = process.env.base_url + Constants.BusinessIncorporationDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": businessRegistrationNumber,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj?.status === "BAD_REQUEST") {
      exportLog(
        "Get General Details",
        "error",
        businessRegistrationNumber,
        { url, headers },
        obj
      );
    } else {
      exportLog(
        "Get General Details",
        "success",
        businessRegistrationNumber,
        { url, headers },
        obj
      );

      if (req?.headers?.authorization) {
        let SessionData = await FetchSessionData(req?.headers);

        // Creating the new address object using registration details
        let address = {
          line1: obj.registrationAddress_1,
          line2: obj.registrationAddress_2 || "AddressLine_2",
          city: obj.registrationCity || "City", // Replace with actual city field if available
          state: obj.registrationState || "State", // Replace with actual state field if available
          postal_code: obj.registrationPostCode,
          country: obj.registrationCountry,
        };

        SessionData.address = address;

        SetSessionData(req?.headers?.authorization, SessionData);
      }
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get General Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Post Business Address Details
export const postBusinessAddressDetails = async (req, res) => {
  const {
    businessRegistrationNumber,
    businessName,
    businessType,
    tradeName,
    settlorName,
    trusteeName,
    email,
    partnerName,
    partnerState,
    partnerCountry,
    associationName,
    associationNumber,
    associationChairPerson,
    registrationAddress_1,
    registrationAddress_2,
    registrationCity,
    registrationState,
    registrationPostCode,
    registrationCountry,
    sameBusinessAddress,
    businessAddress_1,
    businessAddress_2,
    businessCity,
    businessState,
    businessPostCode,
    businessCountry,
    businessKybMode,
  } = req.query;

  try {
    const url = process.env.base_url + Constants.BusinessIncorporationDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
      "x-business-id": businessRegistrationNumber,
      "x-email-id": email,
    };

    const requestBody = {
      emailId: email,

      //Business KYB Details
      businessRegistrationNumber: businessRegistrationNumber,
      businessName: businessName,
      businessType: businessType,

      //Business Address Details
      registrationAddress_1: registrationAddress_1,
      registrationPostCode: registrationPostCode,
      registrationCountry: registrationCountry,

      //Business Additional Info
      sameBusinessAddress: sameBusinessAddress,
      businessKybMode: businessKybMode,
    };

    if (registrationAddress_2) {
      requestBody.registrationAddress_2 = registrationAddress_2;
    }
    if (registrationCity) {
      requestBody.registrationCity = registrationCity;
    }
    if (registrationState) {
      requestBody.registrationState = registrationState;
    }

    if (tradeName) {
      requestBody.tradeName = tradeName;
    }

    if (settlorName) {
      requestBody.settlorName = settlorName;
    }

    if (trusteeName) {
      requestBody.trusteeName = trusteeName;
    }

    if (businessType === "PARTNERSHIP") {
      requestBody.partnerName = partnerName;
      requestBody.partnerState = partnerState;
      requestBody.partnerCountry = partnerCountry;
    } else if (businessType === "ASSOCIATION") {
      requestBody.associationName = associationName;
      requestBody.associationNumber = associationNumber;
      requestBody.associationChairPerson = associationChairPerson;
    }

    if (sameBusinessAddress === "no") {
      requestBody.businessAddress_1 = businessAddress_1;
      requestBody.businessPostCode = businessPostCode;
      requestBody.businessCountry = businessCountry;

      if (businessAddress_2) {
        requestBody.businessAddress_2 = businessAddress_2;
      }
      if (businessCity) {
        requestBody.businessCity = businessCity;
      }
      if (businessState) {
        requestBody.businessState = businessState;
      }
    }

    const response = await axios.post(url, requestBody, { headers });
    let obj = response.data;
    if (obj?.status === "SUCCESS") {
      exportLog(
        "Post General Details",
        "success",
        email,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Post General Details",
        "error",
        email,
        { url, requestBody, headers },
        obj
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Post General Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Patch Business Address Details
export const patchBusinessAddressDetails = async (req, res) => {
  const {
    businessRegistrationNumber,
    businessName,
    businessType,
    tradeName,
    settlorName,
    trusteeName,
    partnerName,
    partnerState,
    partnerCountry,
    associationName,
    associationNumber,
    associationChairPerson,
    registrationAddress_1,
    registrationAddress_2,
    registrationCity,
    registrationState,
    registrationPostCode,
    registrationCountry,
    sameBusinessAddress,
    businessAddress_1,
    businessAddress_2,
    businessCity,
    businessState,
    businessPostCode,
    businessCountry,
  } = req.query;

  try {
    const url = process.env.base_url + Constants.BusinessIncorporationDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
      "x-business-id": businessRegistrationNumber,
    };

    let businessDetailsObj = null;
    //Get Business Details
    try {
      const response2 = await axios.get(url, { headers });
      if (response2.data) {
        businessDetailsObj = response2.data;
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        res
          .status(404)
          .json({ status: "NOT_FOUND", message: "Business details not found" });
      } else {
        res.status(400).json({ status: "BAD_REQUEST", message: error.message });
      }
    }

    const requestBody = {};

    //Mandatory Fields
    if (businessDetailsObj.businessName) {
      if (businessDetailsObj.businessName !== businessName) {
        requestBody.businessName = businessName;
      }
    }
    if (businessDetailsObj.businessType) {
      if (businessDetailsObj.businessType !== businessType) {
        requestBody.businessType = businessType;
      }
    }
    if (businessDetailsObj.registrationAddress_1) {
      if (businessDetailsObj.registrationAddress_1 !== registrationAddress_1) {
        requestBody.registrationAddress_1 = registrationAddress_1;
      }
    }
    if (businessDetailsObj.registrationPostCode) {
      if (businessDetailsObj.registrationPostCode !== registrationPostCode) {
        requestBody.registrationPostCode = registrationPostCode;
      }
    }
    if (businessDetailsObj.registrationCountry) {
      if (businessDetailsObj.registrationCountry !== registrationCountry) {
        requestBody.registrationCountry = registrationCountry;
      }
    }
    if (businessDetailsObj.sameBusinessAddress) {
      if (businessDetailsObj.sameBusinessAddress !== sameBusinessAddress) {
        requestBody.sameBusinessAddress = sameBusinessAddress;
      }
    }
    if (businessDetailsObj.businessAddress_1) {
      if (businessDetailsObj.businessAddress_1 !== businessAddress_1) {
        requestBody.businessAddress_1 = businessAddress_1;
      }
    }
    if (businessDetailsObj.businessPostCode) {
      if (businessDetailsObj.businessPostCode !== businessPostCode) {
        requestBody.businessPostCode = businessPostCode;
      }
    }
    if (businessDetailsObj.businessCountry) {
      if (businessDetailsObj.businessCountry !== businessCountry) {
        requestBody.businessCountry = businessCountry;
      }
    }

    //Non-mandatory Fields
    if (businessDetailsObj.tradeName) {
      if (businessDetailsObj.tradeName !== tradeName) {
        requestBody.tradeName = tradeName;
      }
    } else {
      if (tradeName) {
        requestBody.tradeName = tradeName;
      }
    }

    if (businessDetailsObj.settlorName) {
      if (businessDetailsObj.settlorName !== settlorName) {
        requestBody.settlorName = settlorName;
      }
    } else {
      if (settlorName) {
        requestBody.settlorName = settlorName;
      }
    }

    if (businessDetailsObj.trusteeName) {
      if (businessDetailsObj.trusteeName !== trusteeName) {
        requestBody.trusteeName = trusteeName;
      }
    } else {
      if (trusteeName) {
        requestBody.trusteeName = trusteeName;
      }
    }

    if (businessDetailsObj.partnerName) {
      if (businessDetailsObj.partnerName !== partnerName) {
        requestBody.partnerName = partnerName;
      }
    } else {
      if (partnerName) {
        requestBody.partnerName = partnerName;
      }
    }

    if (businessDetailsObj.partnerState) {
      if (businessDetailsObj.partnerState !== partnerState) {
        requestBody.partnerState = partnerState;
      }
    } else {
      if (partnerState) {
        requestBody.partnerState = partnerState;
      }
    }

    if (businessDetailsObj.partnerCountry) {
      if (businessDetailsObj.partnerCountry !== partnerCountry) {
        requestBody.partnerCountry = partnerCountry;
      }
    } else {
      if (partnerCountry) {
        requestBody.partnerCountry = partnerCountry;
      }
    }

    if (businessDetailsObj.associationName) {
      if (businessDetailsObj.associationName !== associationName) {
        requestBody.associationName = associationName;
      }
    } else {
      if (associationName) {
        requestBody.associationName = associationName;
      }
    }

    if (businessDetailsObj.associationNumber) {
      if (businessDetailsObj.associationNumber !== associationNumber) {
        requestBody.associationNumber = associationNumber;
      }
    } else {
      if (associationNumber) {
        requestBody.associationNumber = associationNumber;
      }
    }

    if (businessDetailsObj.associationChairPerson) {
      if (
        businessDetailsObj.associationChairPerson !== associationChairPerson
      ) {
        requestBody.associationChairPerson = associationChairPerson;
      }
    } else {
      if (associationChairPerson) {
        requestBody.associationChairPerson = associationChairPerson;
      }
    }

    if (businessDetailsObj.registrationAddress_2) {
      if (businessDetailsObj.registrationAddress_2 !== registrationAddress_2) {
        requestBody.registrationAddress_2 = registrationAddress_2;
      }
    } else {
      if (registrationAddress_2) {
        requestBody.registrationAddress_2 = registrationAddress_2;
      }
    }

    if (businessDetailsObj.registrationCity) {
      if (businessDetailsObj.registrationCity !== registrationCity) {
        requestBody.registrationCity = registrationCity;
      }
    } else {
      if (registrationCity) {
        requestBody.registrationCity = registrationCity;
      }
    }

    if (businessDetailsObj.registrationState) {
      if (businessDetailsObj.registrationState !== registrationState) {
        requestBody.registrationState = registrationState;
      }
    } else {
      if (registrationState) {
        requestBody.registrationState = registrationState;
      }
    }

    if (businessDetailsObj.businessAddress_2) {
      if (businessDetailsObj.businessAddress_2 !== businessAddress_2) {
        requestBody.businessAddress_2 = businessAddress_2;
      }
    } else {
      if (businessAddress_2) {
        requestBody.businessAddress_2 = businessAddress_2;
      }
    }

    if (businessDetailsObj.businessCity) {
      if (businessDetailsObj.businessCity !== businessCity) {
        requestBody.businessCity = businessCity;
      }
    } else {
      if (businessCity) {
        requestBody.businessCity = businessCity;
      }
    }

    if (businessDetailsObj.businessState) {
      if (businessDetailsObj.businessState !== businessState) {
        requestBody.businessState = businessState;
      }
    } else {
      if (businessState) {
        requestBody.businessState = businessState;
      }
    }

    const response = await axios.patch(url, requestBody, { headers });
    let obj = response.data;
    if (obj.status === "SUCCESS") {
      exportLog(
        "Update General Details",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );

      await UpdateFailedReason(req);
    } else {
      exportLog(
        "Update General Details",
        "error",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Update General Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

/* <-- General Details Ends --> */

/* <-- Business Details Starts --> */

//Get Additional Business Details
export const getAdditionalBusinessDetails = async (req, res) => {
  const { businessRegistrationNumber } = req.query;

  try {
    const url = process.env.base_url + Constants.AdditionalBusinessDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": businessRegistrationNumber,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj?.status && obj?.status === "BAD_REQUEST") {
      exportLog(
        "Get Additional Business Details",
        "error",
        businessRegistrationNumber,
        { url, headers },
        obj
      );
    } else {
      exportLog(
        "Get Additional Business Details",
        "success",
        businessRegistrationNumber,
        { url, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Additional Business Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

//Risk Assessment Info
export const postRiskAssessmentInfo = async (req, res) => {
  try {
    const url = process.env.base_url + Constants.AdditionalBusinessDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
    };
    const requestBody = {
      businessRegistrationNumber: req.body.businessRegistrationNumber,
      emailId: req.body.email,
      regCountry: req.body.registeredCountry,
      registeredDate: convertToYYYYMMDD(req.body.registeredDate),
      countryOfOperation: req.body.countryOfOperation,
      totalEmployees: req.body.totalEmployees,
      annualTurnover: req.body.annualTurnover,
      industrySector: req.body.industrySector,

      transactionCountries: req.body.transactionCountries,
      intendedUseOfAccount: req.body.intendedUseOfAccount,

      countryIp: req.body.countryIP,
      deviceInfo: req.body.deviceInfo,
      ipAddress: req.body.ipAddress,
      sessionId: req.body.sessionId,
    };

    const region = req.body.region;

    if (req.body.businessKybMode === "E_KYC") {
      requestBody.searchId = req.body.searchId;
    }

    if (req.body.registrationType !== "") {
      requestBody.regType = req.body.registrationType;
    }
    if (req.body.legislationName !== "") {
      requestBody.legislationName = req.body.legislationName;
    }
    if (req.body.legislationType !== "") {
      requestBody.legislationType = req.body.legislationType;
    }
    if (req.body.taxCountry !== "") {
      requestBody.country = req.body.taxCountry;
    }
    if (req.body.taxNumber !== "") {
      requestBody.taxNumber = req.body.taxNumber;
    }
    if (!req.body.regulatedTrustType) {
      requestBody.regulatedTrustType = req.body.regulatedTrustType;
    }
    if (!req.body.unregulatedTrustType) {
      requestBody.unregulatedTrustType = req.body.unregulatedTrustType;
    }

    if (req.body.travelRestrictedCountry !== "") {
      requestBody.travelRestrictedCountry = req.body.travelRestrictedCountry;
    }
    if (req.body.restrictedCountries !== "") {
      requestBody.restrictedCountry = req.body.restrictedCountries;
    }
    if (req.body.ofacLicencePresent !== "") {
      requestBody.ofacLicencePresent = req.body.ofacLicencePresent;
    }

    if (req.body.website !== "") {
      requestBody.website = req.body.website;
    }

    if (req.body.businessType === "PUBLIC_COMPANY") {
      requestBody.listedExchange = req.body.listedExchange;
    }

    if (region === "CA") {
      requestBody.description = req.body.businessDescription;
    }

    if (region === "EU") {
      requestBody.monthlyTransactionVolumeDebit =
        req.body.monthlyTransactionVolumeDebit;
      requestBody.monthlyTransactionsDebit = req.body.monthlyTransactionsDebit;
      requestBody.averageTransactionValueDebit =
        req.body.averageTransactionValueDebit;
      requestBody.topTransactionCountriesDebit =
        req.body.topTransactionCountriesDebit;
      requestBody.topBeneficiaries = req.body.topBeneficiariesDebit;
      requestBody.monthlyTransactionVolumeCredit =
        req.body.monthlyTransactionVolumeCredit;
      requestBody.monthlyTransactionsCredit =
        req.body.monthlyTransactionsCredit;
      requestBody.averageTransactionValueCredit =
        req.body.averageTransactionValueCredit;
      requestBody.topTransactionCountriesCredit =
        req.body.topTransactionCountriesCredit;
      requestBody.topRemitters = req.body.topBeneficiariesCredit;
      requestBody.intendedUses = req.body.intendedUses;
    }

    if (req.body.searchId) {
      requestBody.searchId = req.body.searchId;
    }

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj.status === "SUCCESS") {
      exportLog(
        "Post Additional Business Details",
        "success",
        req.body.businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Post Additional Business Details",
        "error",
        req.body.businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Post Additional Business Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const patchRiskAssessmentInfo = async (req, res) => {
  var businessRegistrationNumber = req.body.businessRegistrationNumber;
  var registeredCountry = req.body.registeredCountry;
  var registeredDate = convertToYYYYMMDD(req.body.registeredDate);
  var listedExchange = req.body.listedExchange;
  var registrationType = req.body.registrationType;
  var legislationName = req.body.legislationName;
  var legislationType = req.body.legislationType;
  var website = req.body.website;
  var taxCountry = req.body.taxCountry;
  var taxNumber = req.body.taxNumber;
  var regulatedTrustType = req.body.regulatedTrustType;
  var unregulatedTrustType = req.body.unregulatedTrustType;
  var totalEmployees = req.body.totalEmployees;
  var annualTurnover = req.body.annualTurnover;
  var industrySector = req.body.industrySector;
  var countryOfOperation = req.body.countryOfOperation;
  var travelRestrictedCountry = req.body.travelRestrictedCountry;
  var restrictedCountries = req.body.restrictedCountries;
  var ofacLicencePresent = req.body.ofacLicencePresent;
  var searchId = req.body.searchId;
  var transactionCountries = req.body.transactionCountries;
  var intendedUseOfAccount = req.body.intendedUseOfAccount;
  var region = req.body.region;
  var description = req.body.businessDescription;

  try {
    const url = process.env.base_url + Constants.AdditionalBusinessDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": businessRegistrationNumber,
    };

    try {
      const res2 = await axios.get(url, { headers });
      const obj2 = res2.data;
      const requestBody = {
        countryIp: req.body.countryIP,
        deviceInfo: req.body.deviceInfo,
        ipAddress: req.body.ipAddress,
        sessionId: req.body.sessionId,
      };

      //Mandatory Fields
      if (obj2.regCountry) {
        if (obj2.regCountry !== registeredCountry) {
          requestBody.regCountry = registeredCountry;
        }
      }
      if (obj2.registeredDate) {
        if (obj2.registeredDate !== registeredDate) {
          requestBody.registeredDate = registeredDate;
        }
      }
      if (obj2.totalEmployees) {
        if (obj2.totalEmployees !== totalEmployees) {
          requestBody.totalEmployees = totalEmployees;
        }
      }
      if (obj2.annualTurnover) {
        if (obj2.annualTurnover !== annualTurnover) {
          requestBody.annualTurnover = annualTurnover;
        }
      }
      if (obj2.industrySector) {
        if (obj2.industrySector !== industrySector) {
          requestBody.industrySector = industrySector;
        }
      }
      if (obj2.countryOfOperation) {
        if (obj2.countryOfOperation !== countryOfOperation) {
          requestBody.countryOfOperation = countryOfOperation;
        }
      }
      if (obj2.searchId) {
        if (obj2.searchId !== searchId) {
          requestBody.searchId = searchId;
        }
      }
      if (obj2.transactionCountries) {
        if (obj2.transactionCountries !== transactionCountries) {
          requestBody.transactionCountries = transactionCountries;
        }
      }
      if (obj2.intendedUseOfAccount) {
        if (obj2.intendedUseOfAccount !== intendedUseOfAccount) {
          requestBody.intendedUseOfAccount = intendedUseOfAccount;
        }
      }
      //Non-mandatory Fields

      if (obj2.listedExchange) {
        if (obj2.listedExchange !== listedExchange) {
          requestBody.listedExchange = listedExchange;
        }
      } else {
        if (listedExchange) {
          requestBody.listedExchange = listedExchange;
        }
      }

      if (obj2.regType) {
        if (obj2.regType !== registrationType) {
          requestBody.regType = registrationType;
        }
      } else {
        if (registrationType) {
          requestBody.regType = registrationType;
        }
      }

      if (obj2.legislationName) {
        if (obj2.legislationName !== legislationName) {
          requestBody.legislationName = legislationName;
        }
      } else {
        if (legislationName) {
          requestBody.legislationName = legislationName;
        }
      }

      if (obj2.legislationType) {
        if (obj2.legislationType !== legislationType) {
          requestBody.legislationType = legislationType;
        }
      } else {
        if (legislationType) {
          requestBody.legislationType = legislationType;
        }
      }

      if (obj2.website) {
        if (obj2.website !== website) {
          requestBody.website = website;
        }
      } else {
        if (website) {
          requestBody.website = website;
        }
      }

      if (obj2.country) {
        if (obj2.country !== taxCountry) {
          requestBody.country = taxCountry;
        }
      } else {
        if (taxCountry) {
          requestBody.country = taxCountry;
        }
      }

      if (obj2.taxNumber) {
        if (obj2.taxNumber !== taxNumber) {
          requestBody.taxNumber = taxNumber;
        }
      } else {
        if (taxNumber) {
          requestBody.taxNumber = taxNumber;
        }
      }

      if (obj2.regulatedTrustType) {
        if (obj2.regulatedTrustType !== regulatedTrustType) {
          requestBody.regulatedTrustType = regulatedTrustType;
        }
      } else {
        if (regulatedTrustType) {
          requestBody.regulatedTrustType = regulatedTrustType;
        }
      }

      if (obj2.unregulatedTrustType) {
        if (obj2.unregulatedTrustType !== unregulatedTrustType) {
          requestBody.unregulatedTrustType = unregulatedTrustType;
        }
      } else {
        if (unregulatedTrustType) {
          requestBody.unregulatedTrustType = unregulatedTrustType;
        }
      }

      if (obj2.travelRestrictedCountry) {
        if (obj2.travelRestrictedCountry !== travelRestrictedCountry) {
          requestBody.travelRestrictedCountry = travelRestrictedCountry;
        }
      } else {
        if (travelRestrictedCountry) {
          requestBody.travelRestrictedCountry = travelRestrictedCountry;
        }
      }

      if (obj2.restrictedCountry) {
        if (obj2.restrictedCountry !== restrictedCountries) {
          requestBody.restrictedCountry = restrictedCountries;
        }
      } else {
        if (restrictedCountries) {
          requestBody.restrictedCountry = restrictedCountries;
        }
      }

      if (obj2.ofacLicencePresent) {
        if (obj2.ofacLicencePresent !== ofacLicencePresent) {
          requestBody.ofacLicencePresent = ofacLicencePresent;
        }
      } else {
        if (ofacLicencePresent) {
          requestBody.ofacLicencePresent = ofacLicencePresent;
        }
      }

      if (obj2.description) {
        if (obj2.description !== description) {
          requestBody.description = description;
        }
      } else {
        if (description) {
          requestBody.description = description;
        }
      }

      if (region === "EU") {
        requestBody.monthlyTransactionVolumeDebit =
          req.body.monthlyTransactionVolumeDebit;
        requestBody.monthlyTransactionsDebit =
          req.body.monthlyTransactionsDebit;
        requestBody.averageTransactionValueDebit =
          req.body.averageTransactionValueDebit;
        requestBody.topTransactionCountriesDebit =
          req.body.topTransactionCountriesDebit;
        requestBody.topBeneficiaries = req.body.topBeneficiariesDebit;
        requestBody.monthlyTransactionVolumeCredit =
          req.body.monthlyTransactionVolumeCredit;
        requestBody.monthlyTransactionsCredit =
          req.body.monthlyTransactionsCredit;
        requestBody.averageTransactionValueCredit =
          req.body.averageTransactionValueCredit;
        requestBody.topTransactionCountriesCredit =
          req.body.topTransactionCountriesCredit;
        requestBody.topRemitters = req.body.topBeneficiariesCredit;
        requestBody.intendedUses = req.body.intendedUses;
      }

      const response = await axios.patch(url, requestBody, { headers });
      let obj = response.data;
      if (obj.status === "SUCCESS") {
        exportLog(
          "Update Additional Business Details",
          "success",
          businessRegistrationNumber,
          { url, requestBody, headers },
          obj
        );

        await UpdateFailedReason(req);
      } else {
        exportLog(
          "Update Additional Business Details",
          "error",
          businessRegistrationNumber,
          { url, requestBody, headers },
          obj
        );
      }
      res.status(200).json(response.data);
    } catch (error) {
      res.status(500).json({ status: "BAD_REQUEST", message: error.message });
    }
  } catch (error) {
    exportLog("Update Additional Business Details", "catch", null, null, null);

    res
      .status(400)
      .json({ message: `Unable to fetch user data.`, status: "BAD_REQUEST" });
  }
};
/* <-- Business Details Ends --> */

/* <-- Applicant Details Starts --> */
//POST Applicant Details
export const GetApplicantBusinessDetails = async (req, res) => {
  const { businessRegistrationNumber } = req.query;

  try {
    const url = process.env.base_url + Constants.ApplicantDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": businessRegistrationNumber,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj?.status && obj?.status === "BAD_REQUEST") {
      exportLog(
        "Get Applicant Details",
        "error",
        businessRegistrationNumber,
        { url, headers },
        obj
      );
    } else {
      exportLog(
        "Get Applicant Details",
        "success",
        businessRegistrationNumber,
        { url, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Applicant Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const postApplicantContactDetails = async (req, res) => {
  const {
    businessRegistrationNumber,
    email,
    //KYC Details
    applicantFirstName,
    applicantMiddleName,
    applicantLastName,
    applicantNationality,
    applicantDateOfBirth,
    applicantKycMode,
    applicantIsResident,

    //Professional Details
    applicantPosition,
    applicantSharePercentage,

    //Address Details
    applicantAddress1,
    applicantAddress2,
    applicantCity,
    applicantState,
    applicantPostcode,
    applicantCountry,

    //Contact Details
    applicantCountryCode,
    applicantContactNumber,
    applicantEmail,

    //Additional
    region,
    occupation,
    applicantDeclaration,

    birthCountry,
  } = req.query;
  try {
    const url = process.env.base_url + Constants.ApplicantDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
    };
    const requestBody = {
      businessRegistrationNumber: businessRegistrationNumber,
      emailId: email,

      //KYC Details
      applicantFirstName: applicantFirstName,

      applicantLastName: applicantLastName,
      applicantNationality: applicantNationality,
      applicantDOB: convertToYYYYMMDD(applicantDateOfBirth),
      applicantKycMode: applicantKycMode,
      applicantIsResident: applicantIsResident,

      //Professional Details
      applicantPosition: applicantPosition,

      //Address Details
      applicantAddress1: applicantAddress1,

      applicantCity: applicantCity,

      applicantPostcode: applicantPostcode,
      applicantCountry: applicantCountry,

      //Contact Details
      applicantCountryCode: applicantCountryCode,
      applicantContactNumber: applicantContactNumber,
      applicantEmail: applicantEmail,
    };

    if (applicantMiddleName !== "") {
      requestBody.applicantMiddleName = applicantMiddleName;
    }
    if (applicantSharePercentage !== "") {
      requestBody.applicantSharePercentage = applicantSharePercentage;
    }
    if (applicantAddress2 !== "") {
      requestBody.applicantAddress2 = applicantAddress2;
    }
    if (applicantState !== "") {
      requestBody.applicantState = applicantState;
    }

    if (region === "CA") {
      requestBody.occupation = occupation;
      requestBody.applicantDeclaration = applicantDeclaration;
    }

    if (region === "EU") {
      requestBody.birthCountry = birthCountry;
    }

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj.status === "SUCCESS") {
      exportLog(
        "Post Applicant Details",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Post Applicant Details",
        "error",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    }

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Post Applicant Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const patchApplicantContactDetails = async (req, res) => {
  const {
    businessRegistrationNumber,

    //KYC Details
    applicantFirstName,
    applicantMiddleName,
    applicantLastName,
    applicantNationality,
    applicantDateOfBirth,
    applicantKycMode,
    applicantIsResident,

    //Professional Details
    applicantPosition,
    applicantSharePercentage,

    //Address Details
    applicantAddress1,
    applicantAddress2,
    applicantCity,
    applicantState,
    applicantPostcode,
    applicantCountry,

    //Contact Details
    applicantCountryCode,
    applicantContactNumber,
    applicantEmail,

    region,
    applicantOccupation,
    applicantDeclaration,

    birthCountry,
  } = req.query;
  try {
    const url = process.env.base_url + Constants.ApplicantDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": businessRegistrationNumber,
    };

    try {
      const response2 = await axios.get(url, { headers });
      const res2 = response2.data;
      const requestBody = {};

      //Mandatory Fields
      if (res2.applicantFirstName) {
        if (res2.applicantFirstName !== applicantFirstName) {
          requestBody.applicantFirstName = applicantFirstName;
        }
      }
      if (res2.applicantLastName) {
        if (res2.applicantLastName !== applicantLastName) {
          requestBody.applicantLastName = applicantLastName;
        }
      }
      if (res2.applicantNationality) {
        if (res2.applicantNationality !== applicantNationality) {
          requestBody.applicantNationality = applicantNationality;
        }
      }
      if (res2.applicantDOB) {
        if (res2.applicantDOB !== applicantDateOfBirth) {
          requestBody.applicantDOB = convertToYYYYMMDD(applicantDateOfBirth);
        }
      }
      if (res2.applicantKycMode) {
        if (res2.applicantKycMode !== applicantKycMode) {
          requestBody.applicantKycMode = applicantKycMode;
        }
      }
      if (res2.applicantIsResident) {
        if (res2.applicantIsResident !== applicantIsResident) {
          requestBody.applicantIsResident = applicantIsResident;
        }
      }
      if (res2.applicantPosition) {
        if (res2.applicantPosition !== applicantPosition) {
          requestBody.applicantPosition = applicantPosition;
        }
      }
      if (res2.applicantAddress1) {
        if (res2.applicantAddress1 !== applicantAddress1) {
          requestBody.applicantAddress1 = applicantAddress1;
        }
      }
      if (res2.applicantCity) {
        if (res2.applicantCity !== applicantCity) {
          requestBody.applicantCity = applicantCity;
        }
      }
      if (res2.applicantPostcode) {
        if (res2.applicantPostcode !== applicantPostcode) {
          requestBody.applicantPostcode = applicantPostcode;
        }
      }
      if (res2.applicantCountry) {
        if (res2.applicantCountry !== applicantCountry) {
          requestBody.applicantCountry = applicantCountry;
        }
      }
      if (res2.applicantCountryCode) {
        if (res2.applicantCountryCode !== applicantCountryCode) {
          requestBody.applicantCountryCode = applicantCountryCode;
        }
      }
      if (res2.applicantContactNumber) {
        if (res2.applicantContactNumber !== applicantContactNumber) {
          requestBody.applicantContactNumber = applicantContactNumber;
        }
      }
      if (res2.applicantEmail) {
        if (res2.applicantEmail !== applicantEmail) {
          requestBody.applicantEmail = applicantEmail;
        }
      }

      //Non-mandatory Fields
      if (res2.applicantMiddleName) {
        if (res2.applicantMiddleName !== applicantMiddleName) {
          requestBody.applicantMiddleName = applicantMiddleName;
        }
      } else {
        if (applicantMiddleName) {
          requestBody.applicantMiddleName = applicantMiddleName;
        }
      }

      if (res2.applicantSharePercentage) {
        if (res2.applicantSharePercentage !== applicantSharePercentage) {
          requestBody.applicantSharePercentage = applicantSharePercentage;
        }
      } else {
        if (applicantSharePercentage) {
          requestBody.applicantSharePercentage = applicantSharePercentage;
        }
      }

      if (res2.applicantAddress2) {
        if (res2.applicantAddress2 !== applicantAddress2) {
          requestBody.applicantAddress2 = applicantAddress2;
        }
      } else {
        if (applicantAddress2) {
          requestBody.applicantAddress2 = applicantAddress2;
        }
      }

      if (res2.applicantState) {
        if (res2.applicantState !== applicantState) {
          requestBody.applicantState = applicantState;
        }
      } else {
        if (applicantState) {
          requestBody.applicantState = applicantState;
        }
      }

      if (region === "CA") {
        if (res2.occupation) {
          if (res2.occupation !== applicantOccupation) {
            requestBody.occupation = applicantOccupation;
          }
        } else {
          if (applicantOccupation) {
            requestBody.occupation = applicantOccupation;
          }
        }

        if (res2.applicantDeclaration) {
          if (res2.applicantDeclaration !== applicantDeclaration) {
            requestBody.applicantDeclaration = applicantDeclaration;
          }
        } else {
          if (applicantDeclaration) {
            requestBody.applicantDeclaration = applicantDeclaration;
          }
        }
      }

      if (region === "EU") {
        requestBody.birthCountry = birthCountry;
      }

      const response = await axios.patch(url, requestBody, { headers });
      let obj = response.data;
      if (obj.status === "SUCCESS") {
        exportLog(
          "Update Applicant Details",
          "success",
          businessRegistrationNumber,
          { url, requestBody, headers },
          obj
        );

        await UpdateFailedReason(req);
      } else {
        exportLog(
          "Update Applicant Details",
          "error",
          businessRegistrationNumber,
          { url, requestBody, headers },
          obj
        );
      }
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json({ status: "BAD_REQUEST", message: error.message });
    }
  } catch (error) {
    exportLog("Update Applicant Details", "catch", null, null, null);

    res
      .status(400)
      .json({ status: "BAD_REQUEST", message: "Cannot fetch user details" });
  }
};

/* <-- Applicant Details Ends --> */

/* <-- Stakeholder Details Starts --> */
export const PostBusinessPartnerAddressDetails = async (req, res) => {
  const {
    businessRegistrationNumber,
    email,
    firstNameStakeholder,
    middleNameStakeholder,
    lastNameStakeholder,
    nationalityStakeholder,
    dateOfBirthStakeholder,
    kycModeStakeholder,
    isResidentStakeholder,
    contactNoStakeholder,
    emailStakeholder,
    positionStakeholder,
    sharePercentageStakeholder,
    addressLine1Stakeholder,
    addressLine2Stakeholder,
    cityStakeholder,
    stateStakeholder,
    postcodeStakeholder,
    countryStakeholder,
    businessNameStakeholder,
    businessRegistrationNumberStakeholder,
    stakeholderPartnerSharePercentage,
    businessEntityTypeStakeholder,
    registeredCountryStakeholder,
    businessPartnerRequire,
    businessKybMode,
  } = req.query;

  const currentDate = new Date();

  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(currentDate.getDate()).padStart(2, "0");
  const hours = String(currentDate.getHours()).padStart(2, "0");
  const minutes = String(currentDate.getMinutes()).padStart(2, "0");
  const seconds = String(currentDate.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  try {
    const url = process.env.base_url + Constants.BusinessStakeHolderDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
    };

    const requestBody = {
      //Required Fields
      businessRegistrationNumber: businessRegistrationNumber,
      emailId: email,

      //Created at
      createdAt: formattedDate,
    };

    if (businessPartnerRequire === "no") {
      requestBody.stakeholderFirstName = firstNameStakeholder;
      requestBody.stakeholderLastName = lastNameStakeholder;
      requestBody.stakeholderDateOfBirth = convertToYYYYMMDD(
        dateOfBirthStakeholder
      );
      requestBody.stakeholderResident = isResidentStakeholder;
      requestBody.stakeholderNationality = nationalityStakeholder;
      requestBody.kycMode = kycModeStakeholder;
      requestBody.stakeholderEmail = emailStakeholder;
      requestBody.stakeholderPosition = positionStakeholder;
      requestBody.stakeholderAddress_1 = addressLine1Stakeholder;
      requestBody.stakeholderPostcode = postcodeStakeholder;
      requestBody.stakeholderCountry = countryStakeholder;

      if (middleNameStakeholder !== "") {
        requestBody.stakeholderMiddleName = middleNameStakeholder;
      }

      if (contactNoStakeholder !== "") {
        requestBody.stakeholderContactNumber = contactNoStakeholder;
      }

      if (
        sharePercentageStakeholder !== "" ||
        sharePercentageStakeholder !== "0"
      ) {
        requestBody.stakeholderSharePercentage = sharePercentageStakeholder;
      }
      if (addressLine2Stakeholder !== "") {
        requestBody.stakeholderAddress_2 = addressLine2Stakeholder;
      }
      if (cityStakeholder !== "" && cityStakeholder !== "null") {
        requestBody.stakeholderCity = cityStakeholder;
      }
      if (stateStakeholder !== "" && stateStakeholder !== "null") {
        requestBody.stakeholderState = stateStakeholder;
      }

      requestBody.stakeholderPartner = "no";
    } else {
      //Business Partner details
      requestBody.stakeholderBusinessName = businessNameStakeholder;
      requestBody.stakeholderBusinessRegistrationNumber =
        businessRegistrationNumberStakeholder;
      requestBody.stakeholderPartnerSharePercentage =
        stakeholderPartnerSharePercentage;
      requestBody.stakeholderBusinessEntityType = businessEntityTypeStakeholder;
      requestBody.stakeholderRegisteredCountry = registeredCountryStakeholder;

      requestBody.stakeholderPartner = "yes";
    }

    const response = await axios.post(url, requestBody, { headers });

    let obj = response.data;
    if (obj.status === "SUCCESS") {
      exportLog(
        "Post Stakeholder Details",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Post Stakeholder Details",
        "error",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Post Stakeholder Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const GetStakeholderDetails = async (req, res) => {
  const { businessRegistrationNumber } = req.query;

  try {
    const url = process.env.base_url + Constants.BusinessStakeHolderDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": businessRegistrationNumber,
    };

    const response = await axios.get(url, { headers });
    let obj = response.data;
    if (obj?.status && obj?.status === "BAD_REQUEST") {
      exportLog(
        "Get Stakeholder Details",
        "error",
        businessRegistrationNumber,
        { url, headers },
        obj
      );
    } else {
      exportLog(
        "Get Stakeholder Details",
        "success",
        businessRegistrationNumber,
        { url, headers },
        obj
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Stakeholder Details", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const PatchBusinessPartnerAddressDetails = async (req, res) => {
  const {
    businessRegistrationNumber,
    email,
    firstNameStakeholder,
    middleNameStakeholder,
    lastNameStakeholder,
    nationalityStakeholder,
    dateOfBirthStakeholder,
    kycModeStakeholder,
    isResidentStakeholder,
    contactNoStakeholder,
    emailStakeholder,
    positionStakeholder,
    sharePercentageStakeholder,
    addressLine1Stakeholder,
    addressLine2Stakeholder,
    cityStakeholder,
    stateStakeholder,
    postcodeStakeholder,
    countryStakeholder,
    businessNameStakeholder,
    businessRegistrationNumberStakeholder,
    businessTypeStakeholder,
    businessEntityTypeStakeholder,
    registeredCountryStakeholder,
    addressLine1BusinessPartner,
    addressLine2BusinessPartner,
    cityBusinessPartner,
    stateBusinessPartner,
    postcodeBusinessPartner,
    countryBusinessPartner,
    businessPartnerRequire,
    businessKybMode,
    slNo,
    stakeholderPartnerSharePercentage,
  } = req.query;

  try {
    const url = process.env.base_url + Constants.BusinessStakeHolderDetails;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": businessRegistrationNumber,
      "x-sl-no": slNo,
    };

    try {
      const response2 = await axios.get(url, { headers });
      const obj2 = response2.data;
      let res2 = null;

      for (var i = 0; i < obj2.length; i++) {
        if (
          obj2[i].stakeholderFirstName === firstNameStakeholder ||
          obj2[i].stakeholderBusinessName === businessNameStakeholder
        ) {
          res2 = obj2[i];
          //headers["x-sl-no"] = obj2[i].slNo;
        }
      }

      const requestBody = {
        createdAt: formattedDate,
      };

      //Mandatory Fields

      if (res2.stakeholderPartnerAddress1) {
        if (res2.stakeholderPartnerAddress1 !== addressLine1BusinessPartner) {
          requestBody.stakeholderPartnerAddress_1 = addressLine1BusinessPartner;
        }
      } else {
        if (addressLine1BusinessPartner) {
          requestBody.stakeholderPartnerAddress_1 = addressLine1BusinessPartner;
        }
      }

      if (res2.stakeholderContactNumber) {
        if (res2.stakeholderContactNumber !== contactNoStakeholder) {
          requestBody.stakeholderContactNumber = contactNoStakeholder;
        }
      } else {
        if (contactNoStakeholder) {
          requestBody.stakeholderContactNumber = contactNoStakeholder;
        }
      }

      if (res2.stakeholderEmail) {
        if (res2.stakeholderEmail !== emailStakeholder) {
          requestBody.stakeholderEmail = emailStakeholder;
        }
      } else {
        if (emailStakeholder) {
          requestBody.stakeholderEmail = emailStakeholder;
        }
      }

      if (res2.stakeholderDateOfBirth) {
        if (res2.stakeholderDateOfBirth !== dateOfBirthStakeholder) {
          requestBody.stakeholderDateOfBirth = convertToYYYYMMDD(
            dateOfBirthStakeholder
          );
        }
      } else {
        if (dateOfBirthStakeholder) {
          requestBody.stakeholderDateOfBirth = convertToYYYYMMDD(
            dateOfBirthStakeholder
          );
        }
      }

      if (res2.stakeholderSharePercentage) {
        if (res2.stakeholderSharePercentage !== sharePercentageStakeholder) {
          requestBody.stakeholderSharePercentage = sharePercentageStakeholder;
        }
      } else {
        if (sharePercentageStakeholder) {
          requestBody.stakeholderSharePercentage = sharePercentageStakeholder;
        }
      }

      if (res2.stakeholderPartnerPostcode) {
        if (res2.stakeholderPartnerPostcode !== postcodeBusinessPartner) {
          requestBody.stakeholderPartnerPostCode = postcodeBusinessPartner;
        }
      } else {
        if (postcodeBusinessPartner) {
          requestBody.stakeholderPartnerPostCode = postcodeBusinessPartner;
        }
      }

      if (res2.stakeholderBusinessType) {
        if (res2.stakeholderBusinessType !== businessTypeStakeholder) {
          requestBody.stakeholderBusinessType = businessTypeStakeholder;
        }
      } else {
        if (businessTypeStakeholder) {
          requestBody.stakeholderBusinessType = businessTypeStakeholder;
        }
      }

      if (res2.stakeholderLastName) {
        if (res2.stakeholderLastName !== lastNameStakeholder) {
          requestBody.stakeholderLastName = lastNameStakeholder;
        }
      } else {
        if (lastNameStakeholder) {
          requestBody.stakeholderLastName = lastNameStakeholder;
        }
      }

      if (res2.stakeholderPartnerState) {
        if (res2.stakeholderPartnerState !== stateBusinessPartner) {
          requestBody.stakeholderPartnerState = stateBusinessPartner;
        }
      } else {
        if (stateBusinessPartner) {
          requestBody.stakeholderPartnerState = stateBusinessPartner;
        }
      }

      if (res2.stakeholderBusinessName) {
        if (res2.stakeholderBusinessName !== businessNameStakeholder) {
          requestBody.stakeholderBusinessName = businessNameStakeholder;
        }
      } else {
        if (businessNameStakeholder) {
          requestBody.stakeholderBusinessName = businessNameStakeholder;
        }
      }

      if (res2.stakeholderBusinessEntityType) {
        if (
          res2.stakeholderBusinessEntityType !== businessEntityTypeStakeholder
        ) {
          requestBody.stakeholderBusinessEntityType =
            businessEntityTypeStakeholder;
        }
      } else {
        if (businessEntityTypeStakeholder) {
          requestBody.stakeholderBusinessEntityType =
            businessEntityTypeStakeholder;
        }
      }

      if (res2.stakeholderNationality) {
        if (res2.stakeholderNationality !== nationalityStakeholder) {
          requestBody.stakeholderNationality = nationalityStakeholder;
        }
      } else {
        if (nationalityStakeholder) {
          requestBody.stakeholderNationality = nationalityStakeholder;
        }
      }

      if (res2.stakeholderState) {
        if (res2.stakeholderState !== stateStakeholder) {
          requestBody.stakeholderState = stateStakeholder;
        }
      } else {
        if (stateStakeholder) {
          requestBody.stakeholderState = stateStakeholder;
        }
      }

      if (res2.stakeholderAddress2) {
        if (res2.stakeholderAddress2 !== addressLine2Stakeholder) {
          requestBody.stakeholderAddress_2 = addressLine2Stakeholder;
        }
      } else {
        if (addressLine2Stakeholder) {
          requestBody.stakeholderAddress_2 = addressLine2Stakeholder;
        }
      }

      if (res2.stakeholderPartner) {
        if (res2.stakeholderPartner !== businessPartnerRequire) {
          requestBody.stakeholderPartner = businessPartnerRequire;
        }
      } else {
        if (businessPartnerRequire) {
          requestBody.stakeholderPartner = businessPartnerRequire;
        }
      }

      if (res2.stakeholderAddress1) {
        if (res2.stakeholderAddress1 !== addressLine1Stakeholder) {
          requestBody.stakeholderAddress_1 = addressLine1Stakeholder;
        }
      } else {
        if (addressLine1Stakeholder) {
          requestBody.stakeholderAddress_1 = addressLine1Stakeholder;
        }
      }

      if (res2.stakeholderFirstName) {
        if (res2.stakeholderFirstName !== firstNameStakeholder) {
          requestBody.stakeholderFirstName = firstNameStakeholder;
        }
      } else {
        if (firstNameStakeholder) {
          requestBody.stakeholderFirstName = firstNameStakeholder;
        }
      }

      if (res2.stakeholderCountry) {
        if (res2.stakeholderCountry !== countryStakeholder) {
          requestBody.stakeholderCountry = countryStakeholder;
        }
      } else {
        if (countryStakeholder) {
          requestBody.stakeholderCountry = countryStakeholder;
        }
      }

      if (res2.stakeholderRegisteredCountry) {
        if (
          res2.stakeholderRegisteredCountry !== registeredCountryStakeholder
        ) {
          requestBody.stakeholderRegisteredCountry =
            registeredCountryStakeholder;
        }
      } else {
        if (registeredCountryStakeholder) {
          requestBody.stakeholderRegisteredCountry =
            registeredCountryStakeholder;
        }
      }

      if (res2.stakeholderPosition) {
        if (res2.stakeholderPosition !== positionStakeholder) {
          requestBody.stakeholderPosition = positionStakeholder;
        }
      } else {
        if (positionStakeholder) {
          requestBody.stakeholderPosition = positionStakeholder;
        }
      }

      if (res2.stakeholderPartnerCountry) {
        if (res2.stakeholderPartnerCountry !== countryBusinessPartner) {
          requestBody.stakeholderPartnerCountry = countryBusinessPartner;
        }
      } else {
        if (countryBusinessPartner) {
          requestBody.stakeholderPartnerCountry = countryBusinessPartner;
        }
      }

      if (res2.stakeholderPartnerCity) {
        if (res2.stakeholderPartnerCity !== cityBusinessPartner) {
          requestBody.stakeholderPartnerCity = cityBusinessPartner;
        }
      } else {
        if (cityBusinessPartner) {
          requestBody.stakeholderPartnerCity = cityBusinessPartner;
        }
      }

      if (res2.stakeholderCity) {
        if (res2.stakeholderCity !== cityStakeholder) {
          requestBody.stakeholderCity = cityStakeholder;
        }
      } else {
        if (cityStakeholder) {
          requestBody.stakeholderCity = cityStakeholder;
        }
      }

      if (res2.stakeholderPostcode) {
        if (res2.stakeholderPostcode !== postcodeStakeholder) {
          requestBody.stakeholderPostcode = postcodeStakeholder;
        }
      } else {
        if (postcodeStakeholder) {
          requestBody.stakeholderPostcode = postcodeStakeholder;
        }
      }

      if (res2.stakeholderMiddleName) {
        if (res2.stakeholderMiddleName !== middleNameStakeholder) {
          requestBody.stakeholderMiddleName = middleNameStakeholder;
        }
      } else {
        if (middleNameStakeholder) {
          requestBody.stakeholderMiddleName = middleNameStakeholder;
        }
      }

      if (res2.stakeholderPartnerAddress2) {
        if (res2.stakeholderPartnerAddress2 !== addressLine2BusinessPartner) {
          requestBody.stakeholderPartnerAddress_2 = addressLine2BusinessPartner;
        }
      } else {
        if (addressLine2BusinessPartner) {
          requestBody.stakeholderPartnerAddress_2 = addressLine2BusinessPartner;
        }
      }

      if (res2.stakeholderBusinessRegistrationNumber) {
        if (
          res2.stakeholderBusinessRegistrationNumber !==
          businessRegistrationNumberStakeholder
        ) {
          requestBody.stakeholderBusinessRegistrationNumber =
            businessRegistrationNumberStakeholder;
        }
      } else {
        if (businessRegistrationNumberStakeholder) {
          requestBody.stakeholderBusinessRegistrationNumber =
            businessRegistrationNumberStakeholder;
        }
      }

      requestBody.stakeholderResident = isResidentStakeholder;
      requestBody.kycMode = kycModeStakeholder;
      requestBody.stakeholderPartnerSharePercentage =
        stakeholderPartnerSharePercentage;

      const response = await axios.patch(url, requestBody, { headers });

      let obj = response.data;
      if (obj.status === "SUCCESS") {
        exportLog(
          "Update Business Stakeholder Details",
          "success",
          businessRegistrationNumber,
          { url, requestBody, headers },
          obj
        );

        await UpdateFailedReason(req);
      } else {
        exportLog(
          "Update Business Stakeholder Details",
          "error",
          businessRegistrationNumber,
          { url, requestBody, headers },
          obj
        );
      }

      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json({ status: "BAD_REQUEST", message: error.message });
    }
  } catch (error) {
    exportLog("Update Business Stakeholder Details", "catch", null, null, null);

    res.status(400).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const DeleteBusinessPartnerAddressDetails = async (req, res) => {
  const { businessRegistrationNumber, slNo } = req.query;

  // Validate query parameters to avoid unnecessary calls
  if (!businessRegistrationNumber || !slNo) {
    return res.status(400).json({
      status: "BAD_REQUEST",
      message:
        "Missing required query parameters: businessRegistrationNumber, slNo, or region",
    });
  }

  const url = `${process.env.base_url}${Constants.BusinessStakeHolderDetails}`;
  const headers = {
    "x-region-id": req.query.region,
    "Content-Type": "application/json",
    "x-request-id": crypto.randomUUID(),
    "x-client-name": "Stylopay Corporate SG",
    "x-program-id": process.env.x_program_id,
    "x-api-key": process.env.x_api_key_zoqq,
    "x-env-id": process.env.x_env_id || "", // Check if `xEnvId` should be environment variable or passed differently
    "x-business-id": businessRegistrationNumber,
    "x-sl-no": slNo,
  };

  try {
    // Execute delete request
    const response = await axios.delete(url, { headers });
    const { data: responseData } = response;

    // Logging and handling response
    const logContext = {
      url,
      headers,
    };

    if (responseData.status === "SUCCESS") {
      exportLog(
        "Delete Business Stakeholder Details",
        "success",
        businessRegistrationNumber,
        logContext,
        responseData
      );

      await UpdateFailedReason(req);
      return res.status(200).json(responseData);
    }

    // Handle failure cases with explicit logging
    exportLog(
      "Delete Business Stakeholder Details",
      "error",
      businessRegistrationNumber,
      logContext,
      responseData
    );

    return res.status(400).json({
      status: "ERROR",
      message: "Failed to delete business partner address details",
      data: responseData,
    });
  } catch (error) {
    // Handle axios errors explicitly
    const errorMessage = error.response
      ? error.response.data.message || error.response.statusText
      : error.message;

    exportLog(
      "Delete Business Stakeholder Details",
      "error",
      businessRegistrationNumber,
      { url, headers },
      { message: errorMessage }
    );

    return res.status(400).json({
      status: "BAD_REQUEST",
      message: errorMessage,
    });
  }
};

/* <-- Stakeholder Details Ends --> */

//NIUM Onboarding related APIs
export const OnboardEKYCUser = async (req, res) => {
  const {
    businessRegistrationNumber,
    name,
    versionId,
    customerHashId,
    clientId,
    region,
    complianceStatus,
  } = req.query;

  try {
    // Prepare the API endpoint and headers
    let url =
      process.env.base_url +
      "/zoqq/api/v2/onboarding/GenericCorporateOnboardReplica";

    const headers = {
      "x-region-id": region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": businessRegistrationNumber,
    };

    // Prepare the request body
    let requestBody = { region };

    if (
      complianceStatus &&
      (complianceStatus === "ERROR" || complianceStatus === "REJECT")
    ) {
      requestBody.customerHashId = customerHashId;
      requestBody.clientId = clientId;
    }

    // Call the Onboard EKYC API
    const response = await axios.post(url, requestBody, { headers });
    const { status } = response.data;

    if (status === "SUCCESS") {
      exportLog(
        "NIUM Corporate Onboarding",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        response.data
      );

      // Fetch onboarding details
      try {
        const FetchOnboardingDetails = await fetchOnboardingDetails(
          businessRegistrationNumber,
          region,
          req.headers
        );

        // Accept Terms and Conditions if FetchOnboardingDetails is successful
        if (FetchOnboardingDetails?.customerHashId) {
          let termsResponse = await AcceptTermsAndConditions(
            businessRegistrationNumber,
            FetchOnboardingDetails.customerHashId,
            name,
            versionId,
            region
          );
        }

        let finalOnboardData = FetchOnboardingDetails;
        finalOnboardData.onboardingStatus = response.data.status;
        finalOnboardData.message = response.data.message;

        res.status(200).json(finalOnboardData);
      } catch (error) {
        exportLog(
          "Fetch Onboarding Details or Accept Terms & Conditions",
          "catch",
          null,
          null,
          null
        );
        return res.status(500).json({
          status: "ERROR",
          message:
            "Failed to fetch onboarding details or accept terms and conditions",
        });
      }
    } else {
      // Log and return the error response if status isn't SUCCESS
      exportLog(
        "NIUM Corporate Onboarding",
        "error",
        businessRegistrationNumber,
        { url, requestBody, headers },
        response.data
      );
      return res
        .status(500)
        .json({ status: "BAD_REQUEST", message: response.data.message });
    }
  } catch (error) {
    // General catch for any unhandled errors
    exportLog("NIUM Corporate Onboarding", "catch", null, null, null);
    return res.status(500).json({
      status: "BAD_REQUEST",
      message: `Onboard User Catch Exception: ${error.message}`,
    });
  }
};

export const fetchOnboardingDetails = async (brn, region, headers) => {
  try {
    let SessionData = await FetchSessionData(headers);

    if (SessionData.internalBusinessId) {
      if (brn !== SessionData.internalBusinessId) {
        return {
          status: "UNAUTHORIZED_ACCESS",
          message:
            "The Business-ID provided does not match the one associated with the current session. Please sign-in again to continue.",
        };
      }
    }

    const url =
      process.env.base_url + Constants.CustomerDetailsByBusinessId + "/" + brn;

    const requestHeaders = {
      "x-region-id": region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
    };

    const response = await axios.get(url, { headers: requestHeaders });
    let obj = response.data[0];

    if (obj?.customerHashId) {
      exportLog(
        "Fetch Onboarding Details",
        "success",
        brn,
        { url, requestHeaders },
        obj
      );

      // Update session data
      SessionData.customerHashId = obj.customerHashId;
      SessionData.clientId = obj.clientId;
      SessionData.caseId = obj.caseId;
      SessionData.walletHashId = obj.walletHashId;
      SessionData.kycUrl = obj.kycUrl;

      SetSessionData(headers.authorization, SessionData);
    } else if (obj?.status === "BAD_REQUEST") {
      exportLog(
        "Fetch Onboarding Details",
        "error",
        brn,
        { url, requestHeaders },
        obj
      );
    }

    return obj;
  } catch (error) {
    exportLog("Fetch Onboarding Details", "catch", null, null, null);
    return { status: "BAD_REQUEST", message: error.message };
  }
};

export const AcceptTermsAndConditions = async (
  businessRegistrationNumber,
  customerHashId,
  name,
  versionId,
  region
) => {
  try {
    const url = `${process.env.base_url}/zoqq/api/v2/onboarding/AcceptTerms&Conditions/${customerHashId}`;

    const headers = {
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": process.env.x_env_id,
      "x-program-id": process.env.x_program_id,
      "x-region-id": region,
    };

    const requestBody = {
      accept: true,
      name: name,
      versionId: versionId,
    };

    const response = await axios.post(url, requestBody, { headers });

    if (response.data.success == "true") {
      exportLog(
        "Accept Terms & Conditions",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        response.data
      );
      return response.data;
    } else {
      exportLog(
        "Accept Terms & Conditions",
        "error",
        businessRegistrationNumber,
        { url, requestBody, headers },
        response.data
      );
      return response.data;
    }
  } catch (error) {
    exportLog("Accept Terms & Conditions", "catch", null, null, null);
    throw new Error("Error in accepting terms and conditions");
  }
};

export const GetTCs = async (req, res) => {
  try {
    const url = process.env.base_url + Constants.TermsAndConditions;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-program-id": process.env.x_program_id,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj.versionId) {
      exportLog(
        "Get Terms & Conditions",
        "success",
        null,
        { url, headers },
        obj
      );
    } else {
      exportLog("Get Terms & Conditions", "error", null, { url, headers }, obj);
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Terms & Conditions", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error });
  }
};

export const AcceptTCs = async (req, res) => {
  try {
    const url = process.env.base_url + Constants.TermsAndConditions;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-program-id": process.env.x_program_id,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj.versionId) {
      exportLog(
        "Get Terms & Conditions",
        "success",
        null,
        { url, headers },
        obj
      );
    } else {
      exportLog("Get Terms & Conditions", "error", null, { url, headers }, obj);
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Terms & Conditions", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error });
  }
};

export const GetUserDetailsClient = async (req, res) => {
  var { customerHashId } = req.query;
  try {
    let SessionData = await FetchSessionData(req.headers);

    if (
      SessionData.customerHashId &&
      customerHashId !== SessionData.customerHashId
    ) {
      res.status(200).json({
        status: "UNAUTHORIZED_ACCESS",
        message:
          "The customer hash-ID provided does not match the one associated with the current session. Please sign-in again to continue.",
      });
      return;
    }

    const url = `${process.env.base_url}/${Constants.FetchIndividualcustomerDetails}/${customerHashId}`;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
    };

    const response = await axios.get(url, { headers });

    let obj = response.data;

    if (obj?.status && obj?.status === "BAD_REQUEST") {
      exportLog(
        "Get Customer Details NIUM",
        "error",
        customerHashId,
        { url, headers },
        obj
      );
    } else {
      exportLog(
        "Get Customer Details NIUM",
        "success",
        customerHashId,
        { url, headers },
        obj
      );

      SessionData.complianceStatus = obj.complianceStatus;

      SetSessionData(req.headers.authorization, SessionData);
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Customer Details NIUM", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error });
  }
};

export const GetUserNium = async (customerHashId, region) => {
  //Logic for get user
  try {
    const getUserUrl = `${process.env.base_url}/${Constants.FetchIndividualcustomerDetails}/${customerHashId}`;
    const getUserHeaders = {
      "Content-Type": "application/json",
      "x-request-id": `GetUserNium-${crypto.randomUUID()}`,
      "x-client-name": "Stylopay Corporate SG",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-program-id": process.env.x_program_id,
      "x-region-id": region,
    };
    const getUser = await axios.get(getUserUrl, { headers: getUserHeaders });
    let obj = getUser.data;
    if (obj?.status && obj?.status === "BAD_REQUEST") {
      exportLog(
        "Get Customer Details NIUM",
        "error",
        customerHashId,
        { url: getUserUrl, headers: getUserHeaders },
        obj
      );
    } else {
      exportLog(
        "Get Customer Details NIUM",
        "success",
        customerHashId,
        { url: getUserUrl, headers: getUserHeaders },
        obj
      );
    }

    return obj;
  } catch (error) {
    exportLog("Get Customer Details NIUM", "catch", null, null, null);

    return obj;
  }
};

export const UploadDocumentsBusiness = async (req, res) => {
  const {
    businessRegistrationNumber,
    customerHashId,
    email,
    businessDocumentType,
    region,
  } = req.body;

  try {
    const url = `${process.env.base_url}/${Constants.UploadDocumentCorporate}/${req.body.customerHashId}`;

    const headers = {
      "x-region-id": req.query.region,
      // Remove "Content-Type" header, as it will be automatically set by Axios for form data
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
    };
    const businessDocumentFile = req.file;

    if (!businessDocumentFile) {
      return res
        .status(400)
        .json({ status: "BAD_REQUEST", message: "No file provided" });
    }

    const businessDocumentFileData =
      businessDocumentFile.buffer.toString("base64");
    const businessDocumentFilename = businessDocumentFile.originalname;
    const businessDocumentFiletype = businessDocumentFile.mimetype;

    let businessRefId = "";

    const getUser = await GetUserNium(customerHashId, req.query.region);

    if (getUser.status !== "BAD_REQUEST") {
      businessRefId = getUser.businessDetails.referenceId;
    }

    let requestBody = {
      businessDetails: {
        //Business document details
        documentDetails: [
          {
            document: [
              {
                document: businessDocumentFileData,
                fileName: businessDocumentFilename,
                fileType: businessDocumentFiletype,
              },
            ],
            documentType: businessDocumentType,
          },
        ],
        referenceId: businessRefId,
      },
      region: region,
    };

    const response = await axios.post(url, requestBody, { headers });
    let obj = response.data;
    if (obj.clientId || obj.caseId) {
      exportLog(
        "Upload Document(s) Business",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Upload Document(s) Business",
        "error",
        { url, requestBody, headers },
        obj
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Upload Document(s) Business", "catch", null, null, null);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: error.message.message });
  }
};
export const RegenerateKycUrl = async (req, res) => {
  const { customerHashId } = req.query;
  try {
    const url = `${process.env.base_url}/${Constants.RegenerateKycUrl}/${customerHashId}`;

    // Use the JSON data as the body of the request
    const headers = {
      "x-region-id": req.query.region,
      "x-client-id": "Stylopay Corporate SG",
      "x-program-id": "SNVAAM0",
      "x-request-id": `RegenerateKycURL-${crypto.randomUUID()}`,
      "x-client-name": "Stylopay Corporate SG",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "Content-Type": "application/json",
    };

    // Make the POST request using axios with JSON data
    const response = await axios.get(url, { headers });

    let obj = response.data;
    if (obj.redirectUrl) {
      exportLog(
        "Regenerate KYC URL",
        "success",
        customerHashId,
        { url, headers },
        obj
      );
    } else {
      exportLog(
        "Regenerate KYC URL",
        "error",
        customerHashId,
        { url, headers },
        obj
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Regenerate KYC URL", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const UploadDocuments = async (req, res) => {
  const {
    businessRegistrationNumber,
    customerHashId,
    email,
    applicantDocumentType,
    applicantDocumentNumber,
    applicantDocumentReferenceNumber,
    applicantDocumentHolderName,
    applicantDocumentIssuanceCountry,
    applicantDocumentIssuingAuthority,
    applicantDocumentIssueDate,
    applicantDocumentExpiryDate,
    fileTypes,
    region,
  } = req.body;

  try {
    const url = `${process.env.base_url}/${Constants.UploadDocumentCorporate}/${req.body.customerHashId}`;

    const headers = {
      "x-region-id": req.query.region,
      // Remove "Content-Type" header, as it will be automatically set by Axios for form data
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
    };
    const applicantDocumentFile = req.files["applicantDocumentFile"][0];
    let applicantDocumentFilePOA = null;

    if (req.files["applicantDocumentFilePOA"]) {
      applicantDocumentFilePOA = req.files["applicantDocumentFilePOA"][0];
    }

    if (
      fileTypes === "both" &&
      !applicantDocumentFile &&
      !applicantDocumentFilePOA
    ) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: "Applicant Document not provided",
      });
    } else if (fileTypes === "both" && !applicantDocumentFilePOA) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: "Applicant Document POA not provided",
      });
    } else if (fileTypes === "poi" && !applicantDocumentFile) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: "Applicant Document file not provided",
      });
    }

    const applicantDocumentFileData =
      applicantDocumentFile.buffer.toString("base64");
    const applicantDocumentFilename = applicantDocumentFile.originalname;
    const applicantDocumentFiletype = applicantDocumentFile.mimetype;

    let applicantDocumentFileDataPOA;
    let applicantDocumentFilenamePOA;
    let applicantDocumentFiletypePOA;
    if (applicantDocumentFilePOA) {
      applicantDocumentFileDataPOA =
        applicantDocumentFilePOA.buffer.toString("base64");
      applicantDocumentFilenamePOA = applicantDocumentFilePOA.originalname;
      applicantDocumentFiletypePOA = applicantDocumentFilePOA.mimetype;
    }

    let ApplicantRefId = "";

    const getUser = await GetUserNium(customerHashId, req.query.region);

    if (getUser.status !== "BAD_REQUEST") {
      ApplicantRefId = getUser.referenceId;
    }

    let requestBody = {
      businessDetails: {
        //Applicant document details
        applicantDetails: {
          documentDetails: [],
          referenceId: ApplicantRefId || "",
        },
      },
      region: region,
    };

    let ref = requestBody.businessDetails.applicantDetails.documentDetails;
    let applicantDocumentBody = {
      document: [
        {
          document: applicantDocumentFileData,
          fileName: applicantDocumentFilename,
          fileType: applicantDocumentFiletype,
        },
      ],
      documentType: applicantDocumentType,
      documentNumber: applicantDocumentNumber,
      documentReferenceNumber: applicantDocumentReferenceNumber,
      documentHolderName: applicantDocumentHolderName,
      documentIssuanceCountry: applicantDocumentIssuanceCountry,
      documentIssuingAuthority: applicantDocumentIssuingAuthority,
      documentIssueDate: applicantDocumentIssueDate,
      documentExpiryDate: applicantDocumentExpiryDate,
    };
    let applicantDocumentPOABody = {
      document: [
        {
          document: applicantDocumentFileDataPOA || "",
          fileName: applicantDocumentFilenamePOA || "",
          fileType: applicantDocumentFiletypePOA || "",
        },
      ],
      documentType: "PROOF_OF_ADDRESS",
    };

    if (fileTypes === "both") {
      ref.push(applicantDocumentBody, applicantDocumentPOABody);
    } else {
      ref.push(applicantDocumentBody);
    }

    const response = await axios.post(url, requestBody, { headers });
    let obj = response.data;
    if (obj.clientId || obj.caseId) {
      exportLog(
        "Upload Document(s) Applicant",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Upload Document(s) Applicant",
        "error",
        { url, requestBody, headers },
        obj
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Upload Document(s) Applicant", "catch", null, null, null);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: error.message.message });
  }
};

export const UploadDocumentLOA = async (req, res) => {
  const {
    businessRegistrationNumber,
    customerHashId,
    email,
    applicantDocumentType,
    fileTypes,
    region,
  } = req.body;

  try {
    const url = `${process.env.base_url}/${Constants.UploadDocumentCorporate}/${req.body.customerHashId}`;

    const headers = {
      "x-region-id": req.query.region,
      // Remove "Content-Type" header, as it will be automatically set by Axios for form data
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
    };
    const applicantDocumentFile = req.files["applicantDocumentFile"][0];

    if (fileTypes === "loa" && !applicantDocumentFile) {
      return res
        .status(400)
        .json({ status: "BAD_REQUEST", message: "LOA Document not provided" });
    }

    const applicantDocumentFileData =
      applicantDocumentFile.buffer.toString("base64");
    const applicantDocumentFilename = applicantDocumentFile.originalname;
    const applicantDocumentFiletype = applicantDocumentFile.mimetype;

    let ApplicantRefId = "";

    const getUser = await GetUserNium(customerHashId, req.query.region);

    if (getUser.status !== "BAD_REQUEST") {
      ApplicantRefId = getUser.referenceId;
    }

    let requestBody = {
      businessDetails: {
        //Applicant document details
        applicantDetails: {
          documentDetails: [],
          referenceId: ApplicantRefId || "",
        },
      },
      region: region,
    };

    let ref = requestBody.businessDetails.applicantDetails.documentDetails;
    let applicantDocumentBody = {
      document: [
        {
          document: applicantDocumentFileData,
          fileName: applicantDocumentFilename,
          fileType: applicantDocumentFiletype,
        },
      ],
      documentType: applicantDocumentType,
    };

    ref.push(applicantDocumentBody);

    const response = await axios.post(url, requestBody, { headers });
    let obj = response.data;
    if (obj.clientId || obj.caseId) {
      exportLog(
        "Upload Document(s) LOA",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Upload Document(s) LOA",
        "error",
        { url, requestBody, headers },
        obj
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Upload Document(s) LOA", "catch", null, null, null);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: error.message.message });
  }
};

export const UploadDocumentsStakeholder = async (req, res) => {
  const {
    businessRegistrationNumber,
    customerHashId,
    email,
    stakeholderDocumentType,
    stakeholderDocumentNumber,
    stakeholderDocumentReferenceNumber,
    stakeholderDocumentHolderName,
    stakeholderDocumentIssuanceCountry,
    stakeholderDocumentIssuingAuthority,
    stakeholderDocumentIssueDate,
    stakeholderDocumentExpiryDate,
    fileTypes,
    stakeholderEmail,
    region,
  } = req.body;

  try {
    const url = `${process.env.base_url}/${Constants.UploadDocumentCorporate}/${req.body.customerHashId}`;

    const headers = {
      "x-region-id": req.query.region,
      // Remove "Content-Type" header, as it will be automatically set by Axios for form data
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-profession-id": "Business_Onboard",
    };
    const stakeholderDocumentFile = req.files["stakeholderDocumentFile"][0];
    let stakeholderDocumentFilePOA = null;

    if (req.files["stakeholderDocumentFilePOA"]) {
      stakeholderDocumentFilePOA = req.files["stakeholderDocumentFilePOA"][0];
    }

    if (
      fileTypes === "both" &&
      !stakeholderDocumentFile &&
      !stakeholderDocumentFilePOA
    ) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: "stakeholder Document not provided",
      });
    } else if (fileTypes === "both" && !stakeholderDocumentFilePOA) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: "stakeholder Document POA not provided",
      });
    } else if (fileTypes === "poi" && !stakeholderDocumentFile) {
      return res.status(400).json({
        status: "BAD_REQUEST",
        message: "stakeholder Document file not provided",
      });
    }

    const stakeholderDocumentFileData =
      stakeholderDocumentFile.buffer.toString("base64");
    const stakeholderDocumentFilename = stakeholderDocumentFile.originalname;
    const stakeholderDocumentFiletype = stakeholderDocumentFile.mimetype;

    let stakeholderDocumentFileDataPOA;
    let stakeholderDocumentFilenamePOA;
    let stakeholderDocumentFiletypePOA;
    if (stakeholderDocumentFilePOA) {
      stakeholderDocumentFileDataPOA =
        stakeholderDocumentFilePOA.buffer.toString("base64");
      stakeholderDocumentFilenamePOA = stakeholderDocumentFilePOA.originalname;
      stakeholderDocumentFiletypePOA = stakeholderDocumentFilePOA.mimetype;
    }

    let stakeholderRefId = "";

    const getUser = await GetUserNium(customerHashId, req.query.region);

    if (getUser.status !== "BAD_REQUEST") {
      let stakeholders = getUser?.stakeholderDetails;

      for (var i = 0; i < stakeholders.length; i++) {
        if (stakeholders[i].email === stakeholderEmail) {
          stakeholderRefId = stakeholders[i].referenceId;
        }
      }
    }

    let requestBody = {
      businessDetails: {
        stakeholders: [
          {
            stakeholderDetails: { documentDetails: [] },
            referenceId: stakeholderRefId || "",
          },
        ],
      },
      region: region,
    };

    let ref =
      requestBody.businessDetails.stakeholders[0].stakeholderDetails
        .documentDetails;
    let stakeholderDocumentBody = {
      document: [
        {
          document: stakeholderDocumentFileData,
          fileName: stakeholderDocumentFilename,
          fileType: stakeholderDocumentFiletype,
        },
      ],
      documentType: stakeholderDocumentType,
      documentNumber: stakeholderDocumentNumber,
      documentReferenceNumber: stakeholderDocumentReferenceNumber,
      documentHolderName: stakeholderDocumentHolderName,
      documentIssuanceCountry: stakeholderDocumentIssuanceCountry,
      documentIssuingAuthority: stakeholderDocumentIssuingAuthority,
      documentIssueDate: stakeholderDocumentIssueDate,
      documentExpiryDate: stakeholderDocumentExpiryDate,
    };
    let stakeholderDocumentPOABody = {
      document: [
        {
          document: stakeholderDocumentFileDataPOA || "",
          fileName: stakeholderDocumentFilenamePOA || "",
          fileType: stakeholderDocumentFiletypePOA || "",
        },
      ],
      documentType: "PROOF_OF_ADDRESS",
    };

    if (fileTypes === "both") {
      ref.push(stakeholderDocumentBody, stakeholderDocumentPOABody);
    } else {
      ref.push(stakeholderDocumentBody);
    }

    const response = await axios.post(url, requestBody, { headers });
    let obj = response.data;
    if (obj.clientId || obj.caseId) {
      exportLog(
        "Upload Document(s) Stakeholder",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Upload Document(s) Stakeholder",
        "error",
        { url, requestBody, headers },
        obj
      );
    }
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Upload Document(s) Stakeholder", "catch", null, null, null);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: error.message.message });
  }
};

//RFI case - NIUM Onboarding
export const GetRFIDetails = async (req, res) => {
  var { caseId, clientId, region } = req.query;
  try {
    const url = `${process.env.base_url}/${Constants.FetcustomerRfiDetails}`;

    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
    };

    const requestBody = {
      region: region,
      clientId: clientId,
      caseId: caseId,
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Business List", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error });
  }
};

export const RespondRFI = async (req, res) => {
  try {
    const url = `${process.env.base_url}/${Constants.RFIRespond}`;

    const json = {};

    // Access files uploaded using multer
    const files = req.files;

    // Add file data to the FormData object
    if (files.length > 0) {
      json.document = files[0].buffer.toString("base64");
      json.fileName = files[0].originalname;
      json.fileType = files[0].mimetype;
    }

    // Add other form data to the FormData object dynamically
    Object.keys(req.body).forEach((key, value) => {
      json[key] = req.body[key];
    });

    // Use the JSON data as the body of the request
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": req.body.brn,
      "x-name-key": req.body.name,
    };

    // Make the POST request using axios with JSON data
    const response = await axios.post(url, json, { headers });

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Business List", "catch", null, null, null);

    // Handle errors and send an appropriate response to the client
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const RespondRFIOtherDocument = async (req, res) => {
  try {
    const url = `${process.env.base_url}/${Constants.RFIRespond}`;

    //const url = `https://apisandbox.spend.nium.com/api/v1/client/${Constants.clientHashId}/corporate/rfi`;

    // Access files uploaded using multer
    const files = req.files;

    // Access request body
    const body = req.body;

    let nameKey = body.documentType;

    // Use the JSON data as the body of the request
    const headers = {
      "x-region-id": req.query.region,
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "x-business-id": body.brn,
      "x-name-key": "otherDocument",
    };

    // Assuming json2 is your initial structure
    var json2 = {
      region: body.region,
      clientId: body.clientId,
      caseId: body.caseId,
      rfiResponseRequest: [
        {
          rfiTemplateId: body.templateId,
          businessInfo: {
            documentDetails: {
              documentType: "otherDocument",
              document: [],
            },
          },
        },
      ],
    };

    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      // Encode the buffer to base64 string for storage
      var base64String = Buffer.from(file.buffer).toString("base64");
      // Create an object for each document with required properties
      var documentObject = {
        document: base64String,
        fileName: file.originalname,
        fileType: file.mimetype,
      };
      // Push the document object to the document array
      json2.rfiResponseRequest[0].businessInfo.documentDetails.document.push(
        documentObject
      );
    }

    // Make the POST request using axios with JSON data
    const response = await axios.post(url, json2, {
      headers,
      validateStatus: false,
    });

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Business List", "catch", null, null, null);

    // Handle errors and send an appropriate response to the client
    res.status(400).json({
      status: "BAD_REQUEST",
      message: JSON.stringify(error.response.data),
    });
  }
};

//Transaction RFI APIs
export const GetTransactionRFIDetails = async (req, res) => {
  var { customerHashId, transactionId } = req.query;
  try {
    const url = `${process.env.base_url}/${Constants.getTransactionsRFI}/${customerHashId}`;

    const headers = {
      "x-region-id": req.query.region,
      "x-client-id": "Stylopay Corporate SG",
      "x-program-id": "SNVAAM0",
      "x-request-id": `TransactionRFIDetails-${crypto.randomUUID()}`,
      "x-client-name": "Stylopay Corporate SG",
      "x-api-key": process.env.x_api_key_zoqq,
      "Content-Type": "application/json",
    };

    const requestBody = {
      page: "1",
      size: "1",
      startDate: "",
      endDate: "",
      transactionType: "",
      authCurrency: "",
      transactionCurrencyCode: "",
      systemReferenceNumber: transactionId,
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Business List", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error });
  }
};

export const RespondTransactionRFI = async (req, res) => {
  try {
    const creds = JSON.parse(req.body.creds);

    const url = `${process.env.base_url}/${Constants.respondTransactionRFI}/${creds.customerHashId}/${creds.transactionId}`;

    // Access files uploaded using multer
    const files = req.files;

    // Add file data to the FormData object
    // if (files && files.length > 0) {
    //   json.document = files[0].buffer.toString("base64");
    //   json.fileName = files[0].originalname;
    //   json.fileType = files[0].mimetype;
    // }

    // Add other form data to the FormData object dynamically

    // Use the JSON data as the body of the request
    const headers = {
      "x-region-id": req.query.region,
      "x-client-id": "Stylopay Corporate SG",
      "x-program-id": "SNVAAM0",
      "x-request-id": `RespondTransaction-${crypto.randomUUID()}`,
      "x-client-name": "Stylopay Corporate SG",
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": xEnvId,
      "Content-Type": "application/json",
    };

    let requestBody = null;

    //For data+file
    let res1 = {
      rfiResponseRequest: [
        {
          rfiHashId: creds?.templateId,
          rfiResponseInfo: {
            identificationDoc: {
              ...(({ creds, ...rest }) => rest)(req.body), // Exclude 'creds' from req.body

              identificationType: creds?.rfiName,
              // "identificationValue": "PP1705069308",
              // "identificationIssuingDate": "02/09/2021",
              // "identificationDocExpiry": "01/09/2025",
              // "identificationIssuingAuthority": "{{clientRegion}}",
              identificationDocument: [
                {
                  fileName: files[0]?.originalname,
                  fileType: files[0]?.mimetype,
                  document: files[0]?.buffer.toString("base64"),
                },
              ],
            },
          },
        },
      ],
    };

    //For data without additionalObject
    let res2 = {
      rfiResponseRequest: [
        {
          rfiHashId: creds?.templateId,
          rfiResponseInfo: {
            // firstName: "Imelda",
            ...(({ creds, ...rest }) => rest)(req.body), // Exclude 'creds' from req.body
          },
        },
      ],
    };

    //For data with additionalObject
    let res3 = {
      rfiResponseRequest: [
        {
          rfiHashId: creds?.templateId,
          rfiResponseInfo: {
            additionalInfo: {
              // firstName: "Imelda",
              ...(({ creds, ...rest }) => rest)(req.body), // Exclude 'creds' from req.body.rfiResponseInfo
            },
          },
        },
      ],
    };

    if (files && files.length > 0) {
      requestBody = res1;
    } else {
      const isPresent =
        req.body.hasOwnProperty("firstName") ||
        req.body.hasOwnProperty("lastName") ||
        req.body.hasOwnProperty("middleName") ||
        req.body.hasOwnProperty("nationality") ||
        req.body.hasOwnProperty("dateOfBirth") ||
        req.body.hasOwnProperty("companyName") ||
        req.body.hasOwnProperty("bankName") ||
        req.body.hasOwnProperty("bankAccountNumber") ||
        req.body.hasOwnProperty("address") ||
        req.body.hasOwnProperty("additionalInfo");

      if (isPresent) {
        requestBody = res2;
      } else {
        requestBody = res3;
      }
    }

    // Make the POST request using axios with JSON data
    const response = await axios.post(url, requestBody, { headers });

    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Get Business List", "catch", null, null, null);

    // Handle errors and send an appropriate response to the client
    res.status(500).json({ status: "BAD_REQUEST", message: error.message });
  }
};

export const SendResetOtp = async (req, res) => {
  var { email } = req.query;
  try {
    const url = `${process.env.mail_base_url}/api/sendtransactionalemail`;

    const headers = {
      "x-region-id": req.query.region,
      "x-request-id": `SendResetOTP-${crypto.randomUUID()}`,
      "x-api-key": process.env.x_api_key,
      "Content-Type": "application/json",
    };

    const requestBody = {
      email: email,
      subject: "Verify One-Time Password (OTP)",
      sender_email: "notification@zoqq.com",
    };

    const response = await axios.post(url, requestBody, { headers });
    res.status(200).json(response.data);
  } catch (error) {
    exportLog("Send Reset OTP", "catch", null, null, null);

    res.status(500).json({ status: "BAD_REQUEST", message: error });
  }
};

export const VerifyResetOtp = async (req, res) => {
  const { email, otp } = req.query;

  // Validate input
  if (!email || !otp) {
    return res
      .status(400)
      .json({ status: "error", message: "Missing email or OTP" });
  }

  try {
    const url = `${process.env.mail_base_url}/api/verifytransactionalotp`;

    const headers = {
      "x-region-id": req.query.region,
      "x-request-id": `VerifyResetOTP-${crypto.randomUUID()}`,
      "x-api-key": process.env.x_api_key,
      "Content-Type": "application/json",
    };

    const requestBody = {
      email: email,
      otp: otp,
    };

    const response = await axios.post(url, requestBody, { headers });

    // Respond with success
    return res.status(200).json(response.data);
  } catch (error) {
    // Enhanced logging
    exportLog("Verify Reset OTP", "error", email, otp, error.message);

    if (error.response) {
      // Handle known error from external service
      let resBody = {
        status: error?.response?.data?.status || "BAD_REQUEST",
        message:
          error?.response?.data?.message ||
          "Something went wrong, please try again later!",
      };
      return res.status(200).json(resBody);
    }

    // Handle unknown server error
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
