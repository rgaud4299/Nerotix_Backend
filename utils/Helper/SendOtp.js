const { sendOtpRegistration } = require("../helper");
const { PrismaClient } = require('@prisma/client');
const db= new PrismaClient();



async function sendOtp(user_data, msg_content_id) {
  if (!user_data) {
    return {
      status_code: 0,
      message: "User not found",
    };
  }

  const msg_contents_data = await db.msg_contents.findFirst({
    where: { id: msg_content_id },
  });

  if (!msg_contents_data) {
    return {
      status_code: 0,
      message: "Message content not found",
    };
  }

  const otpTargets = [];

  if (msg_contents_data.send_sms === "Yes") {
     sendOtpRegistration(user_data.mobile_no, "mobile", user_data.id);
    otpTargets.push("mobile number");
  }

  if (msg_contents_data.send_email === "Yes") {
    sendOtpRegistration(user_data.email, "email", user_data.id);
    otpTargets.push("email id");
  }

  if (msg_contents_data.send_whatsapp === "Yes") {
     sendOtpRegistration(user_data.mobile_no, "whatsapp", user_data.id);
    otpTargets.push("WhatsApp");
  }

  if (msg_contents_data.send_notification === "Yes") {
    sendOtpRegistration(user_data.id, "notification", user_data.id);
    otpTargets.push("notification");
  }

  // Build dynamic message
  let dynamicMessage = "";
  if (otpTargets.length === 1) {
    dynamicMessage = `Verification OTP sent to your registered ${otpTargets[0]}`;
  } else if (otpTargets.length > 1) {
    const last = otpTargets.pop();
    dynamicMessage = `Verification OTP sent to your registered ${otpTargets.join(", ")} and ${last}`;
  } else {
    dynamicMessage = "No OTP sent";
  }

  return {
    status_code: otpTargets.length > 0 ? 1 : 0,
    message: dynamicMessage,
  };
}

module.exports = sendOtp;
