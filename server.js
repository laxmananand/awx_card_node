import express from "express";
import cors from "cors";
import session from "express-session";

import OnboardingRoutes from "./src/Servlets/OnboardingServlet.js";
import SignupRoutes from "./src/Servlets/SignupServlet.js";
import CommonRoutes from "./src/Servlets/CommonServlet.js";
import ExpenseRoutes from "./src/Servlets/expenseserveletnew.js";
import PaymentRoutes from "./src/Servlets/PaymentServlet.js";
import AccountsRoutes from "./src/Servlets/AccountModuleServlet.js";
import SubscriptionRoutes from "./src/Servlets/Subscriptionservlet.js";
import StripeRoutes from "./src/Servlets/StripeServlet.js";
import { subscriptionPlanDetails } from "./src/Controllers/SubscriptionController.js";
import XeroRoutes from "./src/Servlets/XeroServlet.js";
import SettingsRoutes from "./src/Servlets/SettingsServlet.js";
import ZohoRoutes from "./src/Servlets/ZohoServlet.js";
import awxRoutes from "./src/Servlets/AWXServlet.js";

import helmet from "helmet";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import { createClient } from "redis";
import connectRedis from "connect-redis";
import RedisStore from "connect-redis";
import { Store } from "express-session";

//Use local .env for local development
import dotenv from "dotenv";
import { FetchSessionData } from "./src/Modules/SetSessionData.js";
dotenv.config();

//Setting up Express
const app = express();
const port = 9000;

//Setting up Redis store credentials
const redispassword = process.env.redispassword;
const redishost = process.env.redishost;
const redisport = process.env.redisport;
console.log(redishost);
console.log(redispassword);
console.log(redisport);

//client building with redis for session store -- Pabitra
const client = createClient({
  password: redispassword,
  socket: {
    host: redishost,
    port: redisport,
  },
});
await client.connect();
client.on("error", function (err) {
  console.log("Could not establish a connection with redis. " + err);
});
client.on("connect", function (err) {
  console.log("Connected to redis successfully");
});

export { client };

app.use(helmet());

//Setting up request limit from client-side using limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  handler: (req, res) => {
    res.status(429).json({
      status: "TOO_MANY_REQUESTS",
      message: "Too many requests from this IP, please try again later",
    });
  },
});
app.use(limiter);

// Use express-session middleware
app.use(
  session({
    store: new RedisStore({ client: client }),
    secret: "top-secret",
    resave: true,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      secure: true, // required for cookies to work on HTTPS
      httpOnly: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 8,
    },
  })
);

// Accessing the session store from the req object
app.use((req, res, next) => {
  console.log("SessionStore:", req.sessionStore);
  next();
});

// Setting up CORS Middleware
const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));

const sessionCheckMiddleware = (req, res, next) => {
  if (!req.session || !req.session.created) {
    return res
      .status(401)
      .json({ error: "Unauthorized access. Session not found or expired." });
  }
  next();
};

app.use((req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  if (!req.session.created) {
    req.session.created = true;
  }
  next();
});

// Middleware to handle OPTIONS request
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.disable("x-powered-by");
app.set("trust proxy", 1); // Trust the first proxy

const sessionExpiration = 5 * 60 * 1000;

const sessionExpirationMiddleware = (req, res, next) => {
  if (req.session && req.session.lastActive) {
    const now = Date.now();
    const timeSinceLastActive = now - req.session.lastActive;

    if (timeSinceLastActive > sessionExpiration) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json("Error destroying session");
        }
        return res
          .status(500)
          .json({ error: "Node session destroyed due to inactivity" });
      });
      return;
    } else {
      req.session.lastActive = now;
    }
  }
  next();
};

// Add session expiration middleware
app.use(sessionExpirationMiddleware);

// Middleware to update session expiration time on activity
app.use((req, res, next) => {
  if (req.session) {
    req.session.lastActive = Date.now(); // Update last active time to current time
  }
  next();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Define your routes and middleware here
app.use(express.json());

//Middleware to log user activity --@author- Pabitra Sarkar
const logUserActivity = (req, res, next) => {
  const userActivity = {
    //sessionId: req.sessionID,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
  };
  console.log("User Activity:", userActivity);
  next();
};

app.get("/", (req, res) => {
  res.send("WELCOME TO ZOQQ!");
});

//Add one middleware for every API - Abhinav
app.use(logUserActivity);

//Add one middleware for check pro authenticity - Abhinav
export async function onlyForPro(req, res, next) {
  const SessionData = await FetchSessionData(req?.headers);
  const { subscription } = SessionData;
  console.log(subscription + "abhina");
  if (!subscription?.status) {
    return res
      .status(401)
      .json({ status: "BAD_REQUEST", message: "Unauthorized" });
  }
  const { status, planType } = subscription;
  console.log(subscription);
  if (status === "active" && planType === "Pro") {
    next();
    return;
  }

  if (status === "sub01")
    return res.status(401).json({
      status: "BAD_REQUEST",
      message: "Please verify your account first!",
    });

  if (status === "sub02")
    return res.status(401).json({
      status: "BAD_REQUEST",
      message: "Please take Pro subscription first!",
    });

  return res
    .status(401)
    .json({ status: "BAD_REQUEST", message: "Unauthorized" });
}

//Add one middleware for check pro or lite authenticity - Abhinav
export async function onlyForActiveSubscription(req, res, next) {
  const SessionData = await FetchSessionData(req?.headers);
  const { subscription } = SessionData;
  console.log(subscription + "abhina");
  if (!subscription?.status) {
    return res
      .status(401)
      .json({ status: "BAD_REQUEST", message: "Unauthorized" });
  }
  const { status } = subscription;

  if (status === "active") {
    next();
    return;
  }

  if (status === "sub01")
    return res.status(401).json({
      status: "BAD_REQUEST",
      message: "Please verify your account first!",
    });

  if (status === "sub02")
    return res.status(401).json({
      status: "BAD_REQUEST",
      message: "Please take any subscription first!",
    });

  return res
    .status(401)
    .json({ status: "BAD_REQUEST", message: "Unauthorized" });
}

//Setting up routes middleware after the session is set - Shouryadeep
//Signup
app.use("/SignupRoutes", SignupRoutes);

//Expenses
app.use("/expense", ExpenseRoutes);

//Onboarding
app.use("/OnboardingRoutes", OnboardingRoutes);

//Common
app.use("/CommonRoutes", CommonRoutes);

//Payment
app.use("/PaymentRoutes", PaymentRoutes);

//accounts
app.use("/AccountsRoutes", AccountsRoutes);

//Subscription
app.get("/listSubscriptionPlanDetails", subscriptionPlanDetails);

//Node Part of Subscription by Pabitra
app.use("/subscribe", SubscriptionRoutes);

//stripe by Abhinav
app.use("/stripe", StripeRoutes);

//xero by arpan
app.use("/xero", XeroRoutes);

//settings
app.use("/SettingsRoutes", SettingsRoutes);

//zoho
app.use("/zohoRoutes", ZohoRoutes);

//AWX
app.use("/awx", awxRoutes);

app.use("/logout", async (req, res) => {
  let resObj = {
    status: "SUCCESS", // Default status
    message: "Redis and Node session destroyed successfully on logout",
    error: [],
  };

  try {
    // Step 1: Remove session details from Redis
    const redisResponse = await client.del(req.headers.authorization);

    if (!redisResponse) {
      resObj.error.push(
        "1. No data found in Redis client for the given session-ID."
      );
      resObj.status = "PARTIAL_SUCCESS";
      resObj.message = "Node session destroyed, but no Redis data found";
    }

    // Step 2: Destroy the session on the server
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          resObj.error.push("2. Error destroying NODE session");
          resObj.status = "INTERNAL_SERVER_ERROR";
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Step 3: Send final response after both Redis and server session are cleared
    return res.status(200).json(resObj);
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({
      status: "INTERNAL_SERVER_ERROR",
      message: "Error removing client details from Redis or session",
      error: resObj.error.length > 0 ? resObj.error : [error.message],
    });
  }
});

//Test for automated sandbox and production deployment

export default app;
