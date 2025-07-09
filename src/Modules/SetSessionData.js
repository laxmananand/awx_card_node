import { client } from "../../server.js";

export const SetSessionData = async (sessionId, obj) => {
  try {
    // Manually save the session data to Redis
    await client.set(sessionId, JSON.stringify(obj));
    return { status: "SUCCESS", message: "Session data set successfully" };
  } catch (error) {
    return { status: "BAD_REQUEST", message: error };
  }
};

export const FetchSessionData = async (headers) => {
  const sessionId = headers?.authorization;

  if (!sessionId) {
    return { status: "BAD_REQUEST", message: "Session ID is missing" };
  }

  try {
    // Retrieve session data from Redis using sessionId
    const sessionData = await client.get(sessionId);

    if (!sessionData) {
      return { status: "BAD_REQUEST", message: "Session expired or not found" };
    }

    let parsedJson = JSON.parse(sessionData);

    parsedJson.status = "SUCCESS";

    return parsedJson;
  } catch (error) {
    return {
      status: "BAD_REQUEST",
      message: `Error Fetching Session Data: ${error}`,
    };
  }
};
