import axios from "axios";
import * as constant from "../Modules/Expensemodconstant.js";

export const xeroConnection = async (req, res) => {
  const clientId = process.env.xero_client_id;
  const clientSecret = process.env.xero_client_secret;
  const redirectUriXeroCode = req.body.redirectUriXeroCode;
  const redirectUri = redirectUriXeroCode + "/session";
  const code = req.body.code;
  try {
    const response = await axios.post(
      process.env.xeroAccessTokenUrl,
      {
        grant_type: constant.xeroGrantType,
        code: code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
      }
    );
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    return res.send(error.message);
  }
};

export const xeroConnectionCode = async (req, res) => {
  const xeroAuthUrl = process.env.xeroCodeUrl;
  const redirectUriXeroCode = req.body.redirectUriXeroCode;
  const queryParams = new URLSearchParams({
    client_id: process.env.xero_client_id,
    response_type: constant.xeroResponseType,
    redirect_uri: redirectUriXeroCode + "/session",
    scope: constant.xeroScope,
    state: constant.xeroState,
  });
  const redirectUrl = `${xeroAuthUrl}?${queryParams}`;
  console.log(redirectUrl);
  res.send({ redirectUrl });
};

export const xeroConnectionTenantId = async (req, res) => {
  const code = req.body.accessToken;
  try {
    const response = await axios.get(process.env.xeroBaseUrl + "/connections", {
      headers: {
        Authorization: `Bearer ${code}`,
      },
    });
    console.log(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error getting tenantId:", error);
    return res.status(500).send(error.message);
  }
};

export const xeroCreateCustomer = async (req, res) => {
  try {
    const url = process.env.xeroBaseUrl + "/api.xro/2.0/contacts";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${req.body.params.accessToken}`,
      "Xero-Tenant-id": req.body.params.tenantId,
    };
    const requestBody = {
      Contacts: [
        {
          Name: req.body.params.customerName,
          FirstName: req.body.params.firstName,
          LastName: req.body.params.lastName,
          EmailAddress: req.body.params.customerEmail,
        },
      ],
    };
    const response = await axios.post(url, requestBody, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.response);
  }
};

export const xeroCreateInvoice = async (req, res) => {
  const code = req.body.accessToken;
  const details = req.body.updatedFields;
  const contactId = req.body.xeroContactId;
  const tenantId = req.body.tenantId;
  try {
    const url = process.env.xeroBaseUrl + "/api.xro/2.0/Invoices";
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${code}`,
      "Xero-Tenant-id": `${tenantId}`,
    };
    const transformedLineItems = details.itemDetails.map((item) => {
      return {
        Description: item.description,
        Quantity: item.quantity,
        UnitAmount: item.price,
        AccountCode: constant.xeroAccountCode,
        DiscountRate: item.discount,
        TaxAmount: item.quantity * item.price * (item.tax / 100),
        TaxType: "",
      };
    });
    console.log(headers);
    const requestBody = {
      Type: constant.xeroInvoiceType,
      Contact: {
        ContactID: contactId,
      },
      Date: details.date,
      DueDate: details.dueDate,
      LineItems: transformedLineItems,
      Status: constant.xeroStatus,
    };
    console.log(requestBody);
    const response = await axios.post(url, requestBody, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.response);
  }
};

export const xeroGetCustomer = async (req, res) => {
  const code = req.body.code;
  const name = req.body.name;
  const url = process.env.xeroBaseUrl + "/api.xro/2.0"; // Updated endpoint URL
  const tenantId = req.body.tenantId;

  try {
    const encodedName = encodeURIComponent(name);
    const response = await axios.get(
      `${url}/contacts?where=Name=="${encodedName}"`, // Corrected query parameter syntax
      {
        headers: {
          Authorization: `Bearer ${code}`,
          "Xero-Tenant-id": tenantId,
        },
      }
    );
    console.log(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error getting customer data:", error);
    return res.status(200).send(error.response.data);
  }
};

export const xeroCreateCustomerEnd = async (req, res) => {
  try {
    const url = process.env.xeroBaseUrl + "/api.xro/2.0/contacts";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${req.body.code}`,
      "Xero-Tenant-id": req.body.tenantId,
    };
    const requestBody = {
      Contacts: [
        {
          Name: req.body.name,
          FirstName: req.body.firstName,
          LastName: req.body.lastName,
          EmailAddress: req.body.email,
        },
      ],
    };
    const response = await axios.post(url, requestBody, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.response);
  }
};

export const xeroCreateInvoiceBill = async (req, res) => {
  const code = req.body.accessToken;
  const details = req.body.updatedFields;
  const contactId = req.body.xeroContactId;
  const tenantId = req.body.tenantId;
  try {
    const url = process.env.xeroBaseUrl + "/api.xro/2.0/Invoices";
    console.log(url);
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${code}`,
      "Xero-Tenant-id": `${tenantId}`,
    };
    const requestBody = {
      Type: constant.xeroInvoiceBillType,
      Contact: {
        ContactID: contactId,
      },
      Date: details.date,
      DueDate: details.dueDate,
      //"LineItems": transformedLineItems
    };
    console.log(requestBody);
    const response = await axios.post(url, requestBody, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.response);
  }
};

export const xeroUploadInvoiceBill = async (req, res) => {
  const code = req.body.accessToken;
  const fileUrl = req.body.selectedFileurl;
  const invoicesId = req.body.xeroInvoicesID;
  const tenantId = req.body.tenantId;

  try {
    const fileResponse = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });
    const fileData = fileResponse.data;

    const url = `${process.env.xeroBaseUrl}/api.xro/2.0/Invoices/${invoicesId}/Attachments/bill.pdf`;
    console.log(url);

    const headers = {
      "Content-Type": "image/png",
      Authorization: `Bearer ${code}`,
      "Xero-Tenant-id": tenantId,
    };

    const response = await axios.post(url, fileData, { headers });
    console.log(response);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json(error.response.data);
  }
};

export const getPDF = async (req, res) => {
  try {
    const url = req.body.url;

    // Fetch the PDF from the given URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    // Convert the response to an ArrayBuffer and then to a Buffer
    const arrayBuffer = await response.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Set the appropriate content-type for PDF and content disposition for the filename
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=downloaded.pdf");

    // Send the PDF buffer to the client
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error fetching PDF file:", error);
    res.status(500).send("Error fetching PDF file");
  }
};
