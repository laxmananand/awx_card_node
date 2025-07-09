import axios from "axios";
import * as constant from '../Modules/Expensemodconstant.js'
import { v4 as uuidv4 } from 'uuid';
const requestId = uuidv4();
//List Country Code

export const createSubscription2 = async (req, res) => {
  console.log(req)
  const {custHashId}=req.query
  const subscription_session_id=req.body;
  try {
    const url = process.env.base_url+"/zoqq/api/v2/subscription/"+custHashId;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key":  process.env.x_api_key,
      "x-client-name":process.env.x_client_name,
      "x-client-id":process.env.x_client_id,
      "x-program-id":process.env.x_program_id,
      "x-request-id":requestId
    }
  const requestBody = {
    subscription_session_id:subscription_session_id
  }
    console.log(requestBody)

    const response = await axios.post(url, subscription_session_id, { headers });
    console.log(response)
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
   
    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  
  }
};
export const getsubscription = async (req, res) => {
  
  const { 
    customerHashId,subscription_session_id
   } = req.query;
   //console.log(wallethashId)
  try {
    
    const url = process.env.base_url+"/zoqq/api/v2/subscription/subscriptionDetails/"+customerHashId;
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      "x-api-key":  process.env.x_api_key,
      "x-client-name":process.env.x_client_name,
      "x-client-id":process.env.x_client_id,
      "x-program-id":process.env.x_program_id,
      "x-request-id":requestId

    };
    console.log(headers);

    const response = await axios.get(url, { headers });
    console.log(response)
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};

export const subscriptionPlanDetails = async (req, res) => {
  try {
    const url = process.env.base_url + "/zoqq/api/v2/subscription/planDetails";
    const headers = {
      "Content-Type": "application/json",
      "x-api-key":process.env.x_api_key,
      "x-client-name":process.env.x_client_name,
      "x-client-id":process.env.x_client_id,
      "x-program-id":process.env.x_program_id,
      "x-request-id":requestId
    };
  
    const response = await axios.get(url, { headers });
    console.log(response)
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);

    res
      .status(500)
      .json({ status: "BAD_REQUEST", message: "An error occurred" });
  }
};