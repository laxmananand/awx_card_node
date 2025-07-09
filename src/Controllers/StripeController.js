import stripe from "stripe";
import * as constant from "../Modules/Constant.js";
import axios from "axios";
import crypto from "crypto";
import { FetchSessionData, SetSessionData } from "../Modules/SetSessionData.js";
import * as Constants from "../Modules/Constant.js";

export const getBusinessIncorporationDetails = async (brn) => {
  try {
    const url = `${process.env.base_url}${Constants.BusinessIncorporationDetails}`;

    const headers = {
      "Content-Type": "application/json",
      "x-request-id": crypto.randomUUID(),
      "x-client-name": "Stylopay Corporate SG",
      "x-program-id": process.env.x_program_id,
      "x-api-key": process.env.x_api_key_zoqq,
      "x-env-id": process.env.xEnvId,
      "x-business-id": brn,
    };

    const response = await axios.get(url, { headers });
    let data = response.data;

    const address = {
      line1: data.registrationAddress_1 || "AddressLine_1",
      line2: data.registrationAddress_2 || "AddressLine_2",
      city: data.registrationCity || "City",
      state: data.registrationState || "State",
      postal_code: data.registrationPostCode || "PostalCode",
      country: data.registrationCountry || "Country",
    };
    return address;
  } catch (error) {
    return error;
  }
};

const stripeInstance = stripe(process.env.stripe_api_key);

function extractSubscriptionInfo(response) {
  const subscriptionInfo = {
    subscriptionId: response.id,
    status: response.status,
    startDate: response.start_date,
    cancelAt: response.cancel_at,
    canceledAt: response.canceled_at,
    currentPeriodStart: response.current_period_start,
    currentPeriodEnd: response.current_period_end,
    amount: response.plan.amount,
    currency: response.currency,
    customerId: response.customer,
    planType: (response.plan.id === ("price_" + process.env.pro_price_id)) ? "Pro" : ((response.plan.id === ("price_" + process.env.lite_price_id)) ? "Lite" : undefined)
  };

  if (response.status === "canceled") {
    subscriptionInfo.cancelationReason = response.cancellation_details.reason;
    subscriptionInfo.cancelationComment = response.cancellation_details.comment;
  }

  return subscriptionInfo;
}


function extractInvoiceInfo(response) {
  const {
    id,
    amount_due,
    amount_paid,
    created,
    currency,
    due_date,
    invoice_pdf,
    status,
    status_transitions,
    finalized_at,
    marked_uncollectible_at,
    paid_at,
    voided_at,
    lines,
  } = response;

  return {
    id,
    amount_due,
    amount_paid,
    created,
    currency,
    due_date,
    invoice_pdf,
    status,
    status_transitions,
    finalized_at,
    marked_uncollectible_at,
    paid_at,
    voided_at,
    description: lines?.data?.[0]?.description,
  };
}

function extractInvoicesInfo(response) {
  const data = response.map(extractInvoiceInfo);
  return data;
}

const setSubscriptionStatusToSession = async (req, status, planType) => {
  if (req?.headers?.authorization) {
    let SessionData = await FetchSessionData(req?.headers);

    let subscription = {
      status,
      planType
    };

    SessionData.subscription = subscription;

    await SetSessionData(req?.headers?.authorization, SessionData);
  } else {
    console.log("Failed to store session data")
  }
}

const getSubscriptionDetailsFromDB = async (req) => {
  try {
    let { internalBusinessId, complianceStatus } = await FetchSessionData(req.headers);

    if (internalBusinessId) {
      const url =
        process.env.base_url +
        "/" +
        constant.subscriptionUrlV2 +
        "/" +
        internalBusinessId;

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": process.env.x_api_key,
        "x-client-name": process.env.x_client_name,
        "x-client-id": process.env.x_client_id,
        "x-program-id": process.env.x_program_id,
        "x-request-id": crypto.randomUUID(),
      };

      const response = await axios({ method: "get", url, headers });
      let {
        currentPeriodStart,
        amount,
        planType,
        updatedBy,
        updatedAt,
        cancelAt,
        cancellationReason,
        currentPeriodEnd,
        subscriptionSessionId,
        currency,
        subscribedBy,
        subscriptionId,
        stripeCustomerId,
        startDate,
        status,
        message,
      } = response.data;

      let data = {
        currentPeriodStart,
        amount,
        planType,
        updatedBy,
        updatedAt,
        cancelAt,
        cancellationReason,
        currentPeriodEnd,
        sessionId: subscriptionSessionId,
        currency,
        subscribedBy,
        subscriptionId,
        customerId: stripeCustomerId,
        startDate,
        status : status || "sub01",
        message
      };

      await setSubscriptionStatusToSession(req, status, planType)

      if (complianceStatus === "COMPLETED" && (status === "sub01" || status === ""))
        data.status = "sub02"

      return data;
    }

    return { status: "sub01" };
  } catch (e) {
    console.log(e);
    return { message: "Something went wrong!", status: "BAD_REQUEST" };
  }
};

const setSubscriptionDetailsToDB = async (req, data) => {
  try {
    let { internalBusinessId, email } = await FetchSessionData(req.headers);
    const currentTime = Math.floor(Date.now() / 1000);

    const body = {
      ...data,
      updatedAt : currentTime,
      updatedBy : email,
      subscribedBy: data?.subscriptionId ? email : undefined,
      subscribedAt: data?.subscriptionId ? currentTime : undefined,
      cancelAt: data?.cancelAt || ""
    }

    if (internalBusinessId) {
      const url =
        process.env.base_url +
        "/" +
        constant.subscriptionUrlV3 +
        "/" +
        internalBusinessId;

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": process.env.x_api_key,
        "x-client-name": process.env.x_client_name,
        "x-client-id": process.env.x_client_id,
        "x-program-id": process.env.x_program_id,
        "x-request-id": crypto.randomUUID(),
      };

      const response = await axios({ method: "put", url, headers, data: body });

      const { status, planType } = data


      await setSubscriptionStatusToSession(req, status, planType)
      return response.data;
    }

    return { message: "Something went wrong!", status: "BAD_REQUEST" };
  } catch (e) {
    console.log(e);
    return { message: "Something went wrong!", status: "BAD_REQUEST" };
  }
};

const createSubscriptionDetailsToDB = async (req, data) => {
  try {
    let { internalBusinessId } = await FetchSessionData(req.headers);

    if (internalBusinessId) {
      const url =
        process.env.base_url +
        "/" +
        constant.subscriptionUrlV3 +
        "/" +
        internalBusinessId;

      const headers = {
        "Content-Type": "application/json",
        "x-api-key": process.env.x_api_key,
        "x-client-name": process.env.x_client_name,
        "x-client-id": process.env.x_client_id,
        "x-program-id": process.env.x_program_id,
        "x-request-id": crypto.randomUUID(),
      };

      const response = await axios({ method: "post", url, headers, data });

      await setSubscriptionStatusToSession(req, "sub02", "")
      return response.data;
    }

    return { message: "Something went wrong!", status: "BAD_REQUEST" };
  } catch (e) {
    console.log(e);
    return { message: "Something went wrong!", status: "BAD_REQUEST" };
  }
};

const getSessionDataStripe = async (sessionId) => {
  try {
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (e) {
    console.log(e);
    return { status: "BAD_REQUEST", message: "Something went wrong!" };
  }
};

const expireSessionStripe = async (sessionId) => {
  try {
    const session = await stripeInstance.checkout.sessions.expire(sessionId);
    return session;
  } catch (e) {
    console.log(e);
    return { status: "BAD_REQUEST", message: "Something went wrong!" };
  }
};

const getSubscriptionDataStripe = async (subscriptionId) => {
  try {
    const subscription = await stripeInstance.subscriptions.retrieve(
      subscriptionId
    );
    return subscription;
  } catch (e) {
    console.log(e);
    return { status: "BAD_REQUEST", message: "Something went wrong!" };
  }
};

const getActiveSubscriptionDataStripe = async (customerId) => {
  const subscriptions = await stripeInstance.subscriptions.list({
    customer: customerId,
    status: "active",
  });
  return subscriptions.data?.[0];
};

const checkSubscriptionDataAndEligibility = async (req) => {
  const data = await getSubscriptionDetailsFromDB(req);
  if (data?.status === "BAD_REQUEST") {
    return data
  }
  const currentTime = Math.floor(Date.now() / 1000);
  let { customerId, sessionId, subscriptionId, currentPeriodEnd, status } =
    data;

  if (status === "sub01" || status === "inactive" || status === "past_due") {
    return { ...data, isEligible: false }
  }

  if (customerId) {
    if (sessionId) {
      const sessionData = await getSessionDataStripe(sessionId);
      if (sessionData.status === "open") {
        console.log("Session id is open"); //temp
        await expireSessionStripe(sessionId);
      }
      await setSubscriptionDetailsToDB(req, { subscriptionSessionId: "" });
    }
    if (status === "active" && currentPeriodEnd > currentTime) {
      console.log("Have active latest status"); //temp
      return { isEligible: false, ...data };
    } else {
      console.log("Either status is not active or status need to update"); //temp
      const subscriptionData = await getActiveSubscriptionDataStripe(
        customerId
      );
      if (subscriptionData) {
        console.log("This user has active subscription but not updated in DB"); //temp
        const extractedSubscriptionData =
          extractSubscriptionInfo(subscriptionData);
        // update DB
        const updateDBRes = await setSubscriptionDetailsToDB(
          req,
          extractedSubscriptionData
        );
        if (updateDBRes.status === "BAD_REQUEST") {
          return updateDBRes;
        }
        return { isEligible: false, ...extractedSubscriptionData };
      } else if (
        subscriptionId &&
        status === "active" &&
        currentPeriodEnd < currentTime
      ) {
        console.log("Have cancelled subscription but not updated in DB"); //temp
        const subscriptionData = await getSubscriptionDataStripe(
          subscriptionId
        );
        const extractedSubscriptionData =
          extractSubscriptionInfo(subscriptionData);
        await setSubscriptionDetailsToDB(req, extractedSubscriptionData);
        return { isEligible: true, ...extractedSubscriptionData };
      } else {
        console.log("This case is not handled"); //temp
        return { isEligible: true, ...data };
      }
    }
  } else {
    console.log("Does not have customer id"); //temp
    customerId = await createStripeCustomer(req);
    console.log(customerId);
    const responseData = await createSubscriptionDetailsToDB(req, {
      stripeCustomerId: customerId,
    });
    if(responseData.status === "BAD_REQUEST") {
      return responseData
    }
    return { isEligible: true, ...data, customerId };
  }
};

const createStripeCustomer = async (req) => {
  try {
    const data = await FetchSessionData(req.headers);
    let { email, phone, name, address, internalBusinessId } = data;

    // If address is not available, fetch it from business incorporation details
    if (!address) {
      const fetchAddress = await getBusinessIncorporationDetails(
        internalBusinessId
      );

      // Ensure fetchAddress is valid before assigning it
      if (fetchAddress && typeof fetchAddress === "object") {
        address = fetchAddress;
      } else {
        throw new Error(
          "Failed to fetch address from business incorporation details."
        );
      }
    }

    // Create a new Stripe customer
    const customer = await stripeInstance.customers.create({
      email,
      phone,
      name,
      address,
    });

    return customer.id;
  } catch (error) {
    console.error("Error creating Stripe customer:", error.message);
    throw new Error("Unable to create Stripe customer");
  }
};

export const createCheckoutSessionV2 = async (req, res) => {
  try {
    const { priceId } = req.body;
    const customerInfo = await checkSubscriptionDataAndEligibility(req);
    let { customerId, isEligible } = customerInfo;
    if (isEligible) {
      const session = await stripeInstance.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: [
          {
            price: `price_${priceId?.toLowerCase() === "pro" ? process.env.pro_price_id : process.env.lite_price_id}`,
            quantity: 1,
          },
        ],
        customer: customerId,
        mode: "subscription",
        return_url: `${req.headers.origin}/settings/subscription`,
        automatic_tax: { enabled: true },
      });

      const sessionId = session.id;
      const responseData = await setSubscriptionDetailsToDB(req, {
        subscriptionSessionId: sessionId,
      });

      if (responseData?.status !== "BAD_REQUEST") {
        return res.json({ clientSecret: session.client_secret, id: sessionId });
      } else {
        await expireSessionStripe(sessionId);
        return res
          .status(500)
          .json({ status: "BAD_REQUEST", message: "Something went wrong" });
      }
    }

    return res.json({
      status: "BAD_REQUEST",
      message: "You are not eligible for new subscription.",
    });
  } catch (error) {
    console.log(error);
    res
      .json({ status: "BAD_REQUEST", message: "Something went wrong" });
  }
};

export const getSubscriptionDetailsV2 = async (req, res) => {
  try {
    const customerInfo = await checkSubscriptionDataAndEligibility(req);
    if (customerInfo?.status === "past_due") {

      const invoice = await stripeInstance.invoices.list({
        customer: customerInfo.stripeCustomerId,
        status: 'open',
        limit: 1
      });

      if (invoice.data.length > 0) {
        const invoiceId = invoice.data[0].id;

        const paymentLink = await stripeInstance.invoices.retrieve(invoiceId);

        return res.json({
          ...customerInfo,
          paymentUrl: paymentLink.hosted_invoice_url,
          stripeCustomerId: undefined,
          internalBusinessId: undefined,
        });
      }

    }
    return res.json({
      ...customerInfo,
      stripeCustomerId: undefined,
      internalBusinessId: undefined,
    });
  } catch (e) {
    return res.json({ message: "Something went wrong", status: "BAD_REQUEST" });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const data = await checkSubscriptionDataAndEligibility(req);
    if (data.customerId) {
      const startingAfter = req.body.startingAfter;
      let invoices = {};
      if (startingAfter) {
        invoices = await stripeInstance.invoices.list({
          customer: data.customerId,
          starting_after: startingAfter,
        });
      } else {
        invoices = await stripeInstance.invoices.list({
          customer: data.customerId,
        });
      }
      const filterData = {
        ...invoices,
        data: extractInvoicesInfo(invoices?.data || []),
      };
      return res.status(200).json(filterData);
    }

    return res
      .json({ status: "BAD_REQUEST", message: "No invoices found" });
  } catch (e) {
    console.log(e.message);
    return res
      .json({ status: "BAD_REQUEST", message: "Something went wrong" });
  }
};

export const changePlan = async (req, res) => {

  try {
    const data = await checkSubscriptionDataAndEligibility(req);
    if (data.status === "BAD_REQUEST") {
      return res.json(data)
    }

    if (data.isEligible) {
      return res.json({
        status: "BAD_REQUEST",
        message: "You are not subscribed to any plan",
      });
    }

    const stripeSubscriptionId = data.subscriptionId;
    const stripeSubscription = await stripeInstance.subscriptions.retrieve(
      stripeSubscriptionId
    );

    const updatedSubscription = await stripeInstance.subscriptions.update(
      stripeSubscriptionId,
      {
        items: [
          {
            id: stripeSubscription.items.data[0].id,
            price: "price_" + process.env.pro_price_id,
          },
        ],
        proration_behavior: "always_invoice",
      }
    );

    const extractedSubscriptionData =
      extractSubscriptionInfo(updatedSubscription);

    const updateDBRes = await setSubscriptionDetailsToDB(
      req,
      extractedSubscriptionData
    );
    if (updateDBRes?.status === "BAD_REQUEST") {
      return res.json({
        status: "BAD_REQUEST",
        message: "Something went wrong",
      });
    }

    return res.send(extractedSubscriptionData);
  } catch (e) {
    console.log(e.message);
    return res
      .json({ status: "BAD_REQUEST", message: "Something went wrong" });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const data = await checkSubscriptionDataAndEligibility(req);
    if (data.status === "BAD_REQUEST") {
      return res.json(data)
    }

    if (data.isEligible) {
      return res.json({
        status: "BAD_REQUEST",
        message: "You are not subscribed to any plan",
      });
    }

    const stripeSubscriptionId = data.subscriptionId;
    const canceledSubscription = await stripeInstance.subscriptions.update(
      stripeSubscriptionId,
      {
        cancel_at_period_end: true
      });

    const extractedSubscriptionData =
      extractSubscriptionInfo(canceledSubscription);

    const updateDBRes = await setSubscriptionDetailsToDB(
      req,
      extractedSubscriptionData
    );
    if (updateDBRes?.status === "BAD_REQUEST") {
      return res.json({
        status: "BAD_REQUEST",
        message: "Something went wrong",
      });
    }

    return res.send(extractedSubscriptionData);
  } catch (e) {
    return res.json({
      status: "BAD_REQUEST",
      message: "Something went wrong",
    });
  }
};

export const getPaymentMethods = async (req, res) => {
  try {
    const data = await checkSubscriptionDataAndEligibility(req);
    if (data.status === "BAD_REQUEST") {
      return res.json(data);
    }

    if (!data.customerId) {
      return res.json({
        status: "BAD_REQUEST",
        message: "You are not subscribed to any plan",
      });
    }

    const stripeCustomerId = data.customerId;

    const customer = await stripeInstance.customers.retrieve(stripeCustomerId);

    const paymentMethods = await stripeInstance.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });

    const pMData = paymentMethods.data;

    const extractedData = pMData.map((paymentMethod) =>
      extractPaymentInfo(paymentMethod, customer)
    )

    return res.status(200).json(extractedData);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

const extractPaymentInfo = (paymentMethod, customer) => {
  const defaultPaymentMethod = customer.invoice_settings.default_payment_method;

  if (!defaultPaymentMethod) {
    setPaymentMethodDefaultStripe(customer.id, paymentMethod.id)
  }

  console.log("Default: " + defaultPaymentMethod)

  const isDefault = (!defaultPaymentMethod || (paymentMethod.id === defaultPaymentMethod))

  return {
    id: paymentMethod.id,
    brand: paymentMethod.card.brand,
    last4: paymentMethod.card.last4,
    exp_month: paymentMethod.card.exp_month,
    exp_year: paymentMethod.card.exp_year,
    isDefault: isDefault
  };
};

const setPaymentMethodDefaultStripe = async (stripeCustomerId, paymentMethodId) => {
  await stripeInstance.customers.update(
    stripeCustomerId,
    {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    }
  );
}

export const addPaymentMethod = async (req, res) => {
  const { paymentMethodId } = req.body;

  try {
    const data = await checkSubscriptionDataAndEligibility(req);
    if (data.status === "BAD_REQUEST") {
      return res.json(data);
    }

    if (data.isEligible) {
      return res.json({
        status: "BAD_REQUEST",
        message: "You are not subscribed to any plan",
      });
    }

    const stripeCustomerId = data.customerId;


    const paymentMethods = await stripeInstance.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });

    const pMData = paymentMethods.data;
    const count = pMData?.length

    if (count > 4) {
      return res.json({
        status: "BAD_REQUEST",
        message: "You can add upto 5 cards",
      });
    }



    await stripeInstance.paymentMethods.attach(
      paymentMethodId,
      { customer: stripeCustomerId }
    );

    await stripeInstance.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    await getPaymentMethods(req, res)

  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const removePaymentMethod = async (req, res) => {
  const { paymentMethodId } = req.body;

  try {
    const data = await checkSubscriptionDataAndEligibility(req);
    if (data.status === "BAD_REQUEST") {
      return res.json(data);
    }

    console.log(data)

    if (data.isEligible) {
      return res.json({
        status: "BAD_REQUEST",
        message: "You are not subscribed to any plan",
      });
    }

    const stripeCustomerId = data.customerId;

    const customer = await stripeInstance.customers.retrieve(stripeCustomerId);
    if (customer.invoice_settings.default_payment_method === paymentMethodId) {
      return res.send({ status: "BAD_REQUEST", message: "Can't remove default payment method" })
    }


    await stripeInstance.paymentMethods.detach(paymentMethodId);
    await getPaymentMethods(req, res);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const setDefaultPaymentMethod = async (req, res) => {
  const { paymentMethodId } = req.body;

  try {
    const data = await checkSubscriptionDataAndEligibility(req);
    if (data.status === "BAD_REQUEST") {
      return res.json(data);
    }

    if (data.isEligible) {
      return res.json({
        status: "BAD_REQUEST",
        message: "You are not subscribed to any plan",
      });
    }

    const stripeCustomerId = data.customerId;

    await stripeInstance.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    await getPaymentMethods(req, res)

  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
};

export const preventSubscriptionCancellation = async (req, res) => {
  try {
    const data = await checkSubscriptionDataAndEligibility(req);
    if (data.status === "BAD_REQUEST") {
      return res.json(data);
    }

    if (data.isEligible) {
      return res.json({
        status: "BAD_REQUEST",
        message: "You are not subscribed to any plan",
      });
    }

    const stripeSubscriptionId = data.subscriptionId;
    const subscription = await stripeInstance.subscriptions.retrieve(stripeSubscriptionId);

    if (subscription.cancel_at_period_end) {
      const updatedSubscription = await stripeInstance.subscriptions.update(
        stripeSubscriptionId,
        { cancel_at_period_end: false }
      );

      const extractedSubscriptionData = extractSubscriptionInfo(updatedSubscription);

      const updateDBRes = await setSubscriptionDetailsToDB(req, extractedSubscriptionData);
      if (updateDBRes?.status === "BAD_REQUEST") {
        return res.json({
          status: "BAD_REQUEST",
          message: "Something went wrong",
        });
      }

      return res.json({
        status: "SUCCESS",
        message: "Subscription cancellation prevented",
        data: extractedSubscriptionData,
      });
    }

    return res.json({
      status: "SUCCESS",
      message: "Subscription was not set to cancel at period end",
      data: extractSubscriptionInfo(subscription),
    });
  } catch (e) {
    return res.json({
      status: "BAD_REQUEST",
      message: "Something went wrong",
    });
  }
};
