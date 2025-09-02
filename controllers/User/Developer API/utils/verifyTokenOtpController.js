// controllers/Auth/verifyTokenOtpController.js

const { PrismaClient } = require('@prisma/client');
const { error, success } = require('../../../../utils/response');
const { RESPONSE_CODES } = require('../../../../utils/helper');
const prisma = new PrismaClient();

exports.verifyTokenOtpController = async (req, res) => {
    const { otp } = req.body;
    const user_id = req.user?.user_id; // from middleware

    if (!otp) {
        return error(res, "OTP is required", RESPONSE_CODES.VALIDATION_ERROR, 422);
    }
    try {
        const now = new Date();
        // 1. Find OTP record
        const otpRecord = await prisma.otp_verifications.findFirst({
            where: {
                user_id,
                otp: parseInt(otp, 10),
                is_verified: false,
            },
            orderBy: { created_at: "desc" },
        });


        if (!otpRecord) {
            return error(res, "Invalid OTP", RESPONSE_CODES.FAILED, 400);
        }

        if (otpRecord.expires_at < now) {
            return error(res, "OTP expired", RESPONSE_CODES.FAILED, 400);
        }

        // 2. Mark OTP as verified
        await prisma.otp_verifications.update({
            where: { id: otpRecord.id },
            data: { is_verified: true, updated_at: now },
        });

        // 3. Update token status for this user
        const existingToken = await prisma.user_tokens.findFirst({
            where: { user_id, token_type: "api" },
        });
        console.log("token", existingToken);

        if (!existingToken) {
            throw new Error("No API token found for this user");
        }

        // 👇 Toggle status
        const newStatus = existingToken.status === "Active" ? "Inactive" : "Active";

        const token = await prisma.user_tokens.update({
            where: { id: existingToken.id },
            data: { status: newStatus, updated_at: now },
        });
        return success(res, `Token status changed to ${token.status}`);
    } catch (err) {
        console.error("verifyTokenOtpController error:", err);
        return error(res, "Internal server error", RESPONSE_CODES.FAILED, 500);
    }
};




