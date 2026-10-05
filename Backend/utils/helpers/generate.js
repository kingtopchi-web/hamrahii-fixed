
export const generateOtp = (length = 6) => {
  if (length <= 0) throw new Error("OTP length must be greater than 0");

  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); // 0–9
  }

  return otp;
};


export const generateExpiryTime = (minutes = 5) => {
  if (minutes <= 0) throw new Error("Expiry must be greater than 0");

  return new Date(Date.now() + minutes * 60 * 1000);
};
