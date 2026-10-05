const REFERRAL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const generateReferralCode = () => {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += REFERRAL_CHARS.charAt(
      Math.floor(Math.random() * REFERRAL_CHARS.length)
    );
  }
  return code;
};
