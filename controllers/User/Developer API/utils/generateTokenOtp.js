// generateOTP.js
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const dayjs = require("dayjs");
// const { logAuditTrail } = require("../../../services/auditTrailService");
// const { safeParseInt, convertBigIntToString } = require("../../../utils/parser");

const utc = require("dayjs/plugin/utc");
const tz = require("dayjs/plugin/timezone");
const { RESPONSE_CODES, sendOtpRegistration } = require("../../../../utils/helper");
const sendOtp = require("../../../../utils/Helper/SendOtp");
const { success, error } = require("../../../../utils/response");
const { sendDynamicMessage } = require("../../../../utils/Helper/sendDynamicMessage");
dayjs.extend(utc);
dayjs.extend(tz);

const ISTFormat = (d) =>
  d ? dayjs(d).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null;


exports.generateTokenOTP = async (req, res) => {

  try {
    const user_id = req.user.user_id;
// console.log("req.user.user_id",req.user.user_id);

    const msg_cont_id = 1;
    const user_data = await db.users.findFirst({
      where: { id: user_id },
      select: {
        id: true,
        name: true,
        mobile_no: true,
        email: true,
      },
    });

    if (!user_data) {
      return error(
        res,
        "User not found",
        RESPONSE_CODES.NOT_FOUND,
        404
      );
    }

    // const sendotp_data = {
    //   msg_cont_id,
    //   mobile_no: user_data.mobile_no,
    //   email: user_data.email,
    //   user_id
    // };
    // const result = await sendOtp(sendotp_data);



    // create otp and register otp in table 
    const mobile_Otp = await sendOtpRegistration(user_data.mobile_no, "mobile", user_id);


    const placeholders = {
      "{FULL_NAME}": user_data.name,
      "{OTP}": mobile_Otp
    };

    const msg_data = {
      msg_cont_id,
      placeholders,
      mobile_no: user_data.mobile_no,
      email: user_data.email,
      attachment: ""
    };

    sendDynamicMessage(msg_data);

    if (mobile_Otp) {
      return success(res, " OTP sent to your registered mobile no. ", null, RESPONSE_CODES.SUCCESS);
    } else {
      return error(
        res,
        result.message,
        RESPONSE_CODES.VALIDATION_ERROR,
        400
      );
    }

  } catch (err) {
    console.error(err);
    return error(
      res,
      "Server error",
      RESPONSE_CODES.SERVER_ERROR,
      500
    );
  }
};



