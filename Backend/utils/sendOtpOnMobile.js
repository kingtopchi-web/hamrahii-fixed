// import axios from "axios";
// import { XMLParser } from "fast-xml-parser";

// export const sendOtp = async (mobile, message) => {
//   try {
//     console.log(mobile , "this is mobile")
//     const url = `http://sms.whistle.mobi/sendsms.jsp?user=${process.env.WHISTLE_USERNAME}&password=${process.env.WHISTLE_PASSWORD}&senderid=${process.env.WHISTLE_SENDER_ID}&mobiles=${mobile}&sms=${encodeURIComponent(message)}`;

//     const response = await axios.get(url);

//     // XML → JSON Parser
//     const parser = new XMLParser({
//       ignoreAttributes: false,
//       trimValues: true,
//       parseTagValue: true,
//     });

//     const json = parser.parse(response.data);

//     console.log("Parsed SMS Response:", JSON.stringify(json, null, 2));

//     const sms = json?.smslist?.sms;

//     if (sms?.status === "success") {
//       return {
//         success: true,
//         message: "OTP sent successfully",
//         data: sms,
//       };
//     } else {
//       return {
//         success: false,
//         message: sms?.reason || "SMS failed",
//         data: sms,
//       };
//     }
//   } catch (error) {
//     console.error("SMS Error:", error.message);

//     return {
//       success: false,
//       message: "SMS service error",
//       error: error.message,
//     };
//   }
// };

export  const sendSms = async (phoneNumber, message) => {
  // Send sms using Whistle API
  const url = process.env.W_URL;
  const user = process.env.W_USER;
  const senderId = process.env.W_SENDERID;
  const password = process.env.W_PASSWORD;

  if (!phoneNumber) {
    // console.log("Invalid Mobile Number");
    return false;
  }
     const encodedMessage = encodeURIComponent(message);
  let response = await fetch(
    `${url}user=${user}&password=${password}&senderid=${senderId}&mobiles=${phoneNumber}&sms=${encodedMessage}`
  );
  // console.log(response ,"this is response")
  if (response.status !== 200) {
    // console.log("Error in sending SMS" + response);
    return false;
  }
  return response;
};