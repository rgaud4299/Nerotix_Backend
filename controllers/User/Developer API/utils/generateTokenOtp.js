// generateOTP.js
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const dayjs = require("dayjs");
// const { logAuditTrail } = require("../../../services/auditTrailService");
// const { safeParseInt, convertBigIntToString } = require("../../../utils/parser");

const utc = require("dayjs/plugin/utc");
const tz = require("dayjs/plugin/timezone");
const { RESPONSE_CODES } = require("../../../../utils/helper");
const sendOtp = require("../../../../utils/Helper/SendOtp");
const { success, error } = require("../../../../utils/response");
dayjs.extend(utc);
dayjs.extend(tz);

const ISTFormat = (d) =>
  d ? dayjs(d).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null;


exports.generateTokenOTP = async (req, res) => {
  try {
    const user_id = req.user.id;

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
  //  pass  user_data and msg content id 
    const sendotp = await sendOtp(user_data, 2);

    if (sendotp.status_code === 1) {
      return success(res, sendotp.message); // ✅ success helper
    } else {
      return error(
        res,
        sendotp.message,
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



