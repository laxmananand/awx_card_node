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

export default exportLog;