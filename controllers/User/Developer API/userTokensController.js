const crypto = require("crypto");
const dayjs = require("dayjs");
const { success, error } = require("../../../utils/response");
const { RESPONSE_CODES } = require("../../../utils/helper");
const { safeParseInt, convertBigIntToString } = require('../../../utils/parser');
const ISTFormat = (d) => (d ? dayjs(d).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : null);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone)

// 1. Generate or Regenerate Token
exports.generateToken = async (req, res) => {
  try {
    const { token_type } = req.body;
    const user_id = parseInt(req.user.user_id)


    if (!user_id || !token_type) {
      return error(
        res,
        "user_id and token_type are required",
        RESPONSE_CODES.VALIDATION_ERROR,
        422
      );
    }
    const userExists = await prisma.users.findUnique({
      where: { id: parseInt(user_id) },
    });

    if (!userExists) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Generate MD5 token (random string + timestamp for uniqueness)
    const rawString = `${user_id}-${token_type}-${Date.now()}-${Math.random()}`;
    const newToken = crypto.createHash("md5").update(rawString).digest("hex");


    // Check if token already exists for user
    const existing = await prisma.user_tokens.findFirst({
      where: { user_id, token_type },
    });

    let savedToken;
    if (existing) {
      savedToken = await prisma.user_tokens.update({
        where: { id: existing.id },
        data: {
          token: newToken,
          status: "Inactive",
          updated_at: dayjs().toDate(),
        },
      });
    } else {
      savedToken = await prisma.user_tokens.create({
        data: {
          user_id,
          token_type,
          token: newToken,
          status: "Inactive",
          created_at: dayjs().toDate(),
          updated_at: dayjs().toDate(),
        },
      });
    }

    const formatted = convertBigIntToString({
      id: savedToken.id,
      user_id: savedToken.user_id,
      token: savedToken.token,
      token_type: savedToken.token_type,
      status: savedToken.status,
      created_at: ISTFormat(savedToken.created_at),
      updated_at: ISTFormat(savedToken.updated_at),
    });

    return success(res, "Token generated successfully", formatted);
  } catch (err) {
    console.error(err);
    return error(res, "Failed to generate token");
  }
};

// 2. Change Status (Activate / Inactivate)

exports.changeTokenStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const user_id = parseInt(req.user.user_id)


    if (!id || isNaN(id)) {
      return error(res, "Invalid token Id", RESPONSE_CODES.VALIDATION_ERROR, 422);
    }
    if (!["Active", "Inactive"].includes(status)) {
      return error(res, "Invalid status value", RESPONSE_CODES.VALIDATION_ERROR, 422);
    }

    const existing = await prisma.user_tokens.findFirst({
      where: { id, user_id },
    });

    if (!existing) {
      return error(res, "Api Token not found", RESPONSE_CODES.NOT_FOUND, 404);
    }

    if (!existing.token_type==="api") {
      return error(res, "token_type must be 'api'", RESPONSE_CODES.NOT_FOUND, 404);
    }
   
    const newStatus = existing.status === "Active" ? "Inactive" : "Active";

    const updated = await prisma.user_tokens.update({
      where: { id },
      data: { status: newStatus, updated_at: dayjs().toDate() },
    });

   

    const formatted = convertBigIntToString({
      id: updated.id,
      user_id: updated.user_id,
      token: updated.token,
      token_type: updated.token_type,
      status: updated.status,
      created_at: ISTFormat(updated.created_at),
      updated_at: ISTFormat(updated.updated_at),
    });

    return success(res, "Status updated successfully",);
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update status");
  }
};

exports.getTokensByUserId = async (req, res) => {
  try {
    const user_id = parseInt(req.user.user_id);
    const token_type = 'api'
    if (!user_id || isNaN(user_id)) {
      return error(res, "Invalid user ID", RESPONSE_CODES.VALIDATION_ERROR, 422);
    }

    // Fetch tokens for this user
    const token = await prisma.user_tokens.findMany({
      where: { user_id, token_type },
    });

    if (!token || token.length === 0) {
      return error(res, "No Api Tokens Found ", RESPONSE_CODES.NOT_FOUND, 404);
    }

    // Format tokens
    const formatted = token.map((t) =>
      convertBigIntToString({
        id: t.id,
        user_id: t.user_id,
        token: t.token,
        token_type: t.token_type,
        status: t.status,
        created_at: ISTFormat(t.created_at),
        updated_at: ISTFormat(t.updated_at),
      })
    );

    return success(res, " API Tokens fetched successfully", formatted);
  } catch (err) {
    console.error("getTokensByUserId error:", err);
    return error(res, "Failed to fetch tokens", RESPONSE_CODES.FAILED, 500);
  }
};
