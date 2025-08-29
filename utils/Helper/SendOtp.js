const { PrismaClient } = require('@prisma/client');
const db= new PrismaClient();

// Send OTP and Save to DB
const sendOtpRegistration = async (receiver, type, user_id) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

const OtpRegistration=  await db.otp_verifications.create({
    data: {
      user_id: user_id,
      otp: parseInt(otp),
      type: type,
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    }
  });
console.log( OtpRegistration);

  console.log(`OTP for ${receiver} [${type}] is: ${otp}`);
  return otp;
};

async function sendOtp(msg_data) {

  console.log('msg_data.user_id',msg_data.user_id);
  
  if (!msg_data) {
    return {
      status_code: 0,
      message: "Invalid message data",
    };
  }

  // Message template (from msg_contents table )
  const msg_contents_data = await db.msg_contents.findFirst({
    where: { id: msg_data.msg_cont_id },
  });

  if (!msg_contents_data) {
    return {
      status_code: 0,
      message: "Message content not found",
    };
  }

  const otpTargets = [];
  const otps={}

  // 👉 SMS
  if (msg_contents_data.send_sms === "Yes" && msg_data.mobile_no) {
     otps.mobile_Otp=await sendOtpRegistration(msg_data.mobile_no, "mobile",msg_data.user_id);
    otpTargets.push("mobile number");
  }

  // 👉 Email
  if (msg_contents_data.send_email === "Yes" && msg_data.email) {
   otps.email_Otp=  await sendOtpRegistration(msg_data.email, "email",msg_data.user_id);
    otpTargets.push("email id");
  }

  // 👉 WhatsApp
  if (msg_contents_data.send_whatsapp === "Yes" && msg_data.mobile_no) {
    otps.whatsapp_Otp= await sendOtpRegistration(msg_data.mobile_no, "whatsapp",msg_data.user_id);
    otpTargets.push("WhatsApp");
  }

  if (msg_contents_data.send_notification === "Yes") {
    otps.notification_Otp= await sendOtpRegistration(msg_data.mobile_no, "notification",msg_data.user_id);
    otpTargets.push("notification");
  }



  // ✅ Dynamic success message
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
    otps:otps
  };

}

module.exports = sendOtp;
