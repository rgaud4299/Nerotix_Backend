// generateOTP.js
const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const dayjs = require("dayjs");
const { success, error } = require("../../../utils/response");
const { RESPONSE_CODES } = require("../../../utils/helper");
const { logAuditTrail } = require("../../../services/auditTrailService");
const { safeParseInt, convertBigIntToString } = require("../../../utils/parser");

const utc = require("dayjs/plugin/utc");
const tz = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(tz);

const ISTFormat = (d) =>
  d ? dayjs(d).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss") : null;

exports.generateTokenOTP = async (req, res) => {
  try {
    const msg_content_id = req.body.msg_content_id;
    const user_id = req.user.id;

    // 6 digit OTP generate
    const msg_otp = Math.floor(100000 + Math.random() * 900000);
    const email_otp = Math.floor(100000 + Math.random() * 900000);

    // User detail (Prisma way)
    const user_data = await db.users.findUnique({
      where: { id: user_id },
      select: {
        id: true,
        full_name: true,
        company_name: true,
        mobile_no: true,
        email_id: true,
      },
    });

    if (!user_data) {
      return res
        .status(404)
        .json({ status_code: 0, message: "User not found" });
    }

    const date = new Date();

    // Insert OTP record (Prisma way)
    const result = await db.otp_validation.create({
      data: {
        user_id: user_id,
        mobileno: user_data.mobile_no,
        otp_mobile: msg_otp,
        otp_email: email_otp,
        created_at: date,
        updated_at: date,
      },
    });

    if (result) {
      // Placeholder replace
      const placeholders = {
        "{FULL_NAME}": user_data.full_name,
        "{COMPANY_NAME}": user_data.company_name,
        "{OTP}": msg_otp,
      };

      const msg_data = {
        msg_id: msg_content_id,
        placeholders,
        mobileno: user_data.mobile_no,
        email_id: user_data.email_id,
        attachment: "",
      };

  

      return res.json({
        status_code: 1,
        message:
          "Verification OTP sent to your registered mobile number and email id",
      });
    } else {
      return res.json({
        status_code: 0,
        message: "Unable to generate otp",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status_code: 0,
      message: "Server error",
    });
  }
};
