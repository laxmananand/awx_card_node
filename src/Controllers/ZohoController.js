import axios from "axios";
import exportLog from "../Modules/exportLog.js";
import * as constant from "./../Modules/Constant.js";
import FormData from "form-data";
import { SetSessionData, FetchSessionData } from "../Modules/SetSessionData.js";

export const getZohoOAuthToken = async (req) => {
  const form = new FormData();
  form.append("client_id", constant.zoho_client_id);
  form.append("client_secret", constant.zoho_client_secret);
  form.append("grant_type", "refresh_token");
  form.append("refresh_token", constant.zoho_refresh_token);

  let SessionData = await FetchSessionData(req?.headers);

  try {
    const response = await axios.post(
      constant.genetrate_access_token_url,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );
    SessionData.access_token = response.data.access_token;
    SetSessionData(req.headers.authorization, SessionData);
    return { status: "SUCCESS", message: response.data.access_token };
  } catch (error) {
    return {
      status: "BAD_REQUEST",
      message: error.response ? error.response.data : error.message,
    };
  }
};

export const CreateLeadsV2 = async (req, accessToken) => {
  const { email, personName, businessName, countryName, phoneNumber } =
    req.body;

  let splitName = personName.split(" ");
  let firstName = splitName[0];
  let lastName = splitName.length > 1 ? splitName[splitName.length - 1] : ".";

  const requestBody = {
    companyName: businessName,
    lastName: lastName,
    firstName: firstName,
    email: email,
    businessRegisteredCountry: countryName,
    mobile: phoneNumber,
  };

  try {
    // Set up the request headers and body
    const config = {
      method: "post",
      url: `${process.env.base_url}/zoqq/api/v2/zoho/leads`,
      headers: {
        "Content-Type": "application/json",
        "x-request-id": crypto.randomUUID(),
        "x-client-name": "Stylopay Corporate SG",
        "x-program-id": process.env.x_program_id,
        "x-api-key": process.env.x_program_id,
      },
      data: requestBody,
    };

    // Make the POST request using axios
    const response = await axios(config);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};

export const createlead = async (req) => {
  let accessToken = null;
  let SessionData = await FetchSessionData(req?.headers);

  if (SessionData?.access_token) {
    accessToken = SessionData?.access_token;
  } else {
    let accessObj = await getZohoOAuthToken(req);
    accessToken = accessObj?.message;
  }

  try {
    let response = await CreateLeadsV2(req, accessToken);
    return response?.data;
  } catch (error) {
    return error;
  }
};
