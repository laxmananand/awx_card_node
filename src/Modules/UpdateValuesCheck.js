import axios from "axios";
import crypto from "crypto";
import exportLog from "../Modules/exportLog.js";

let xEnvId = process.env.x_env_id || "production";

export const UpdateFailedReason = async (req) => {
  var { businessRegistrationNumber } = req.query;
  try {
    const url = `${process.env.base_url}/zoqq/api/v2/onboarding/OnboardingDetails/${businessRegistrationNumber}`;

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
      failedReason:
        "Your update request has been processed successfully, and your KYC process has been re-initiated. We apologize for the inconvenience. Please wait for further updates.",
    };

    const response = await axios.patch(url, requestBody, { headers });
    let obj = response.data;
    if (obj.status === "SUCCESS") {
      exportLog(
        "Update Failed Reason",
        "success",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    } else {
      exportLog(
        "Update Failed Reason",
        "error",
        businessRegistrationNumber,
        { url, requestBody, headers },
        obj
      );
    }

    return true;
  } catch (error) {
    exportLog("Update Failed Reason", "error", null, null, null);
    return true;
  }
};
