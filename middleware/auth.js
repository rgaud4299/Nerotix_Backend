const dayjs = require("dayjs");
const { verifyToken } = require("../utils/jwt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { RESPONSE_CODES } = require("../utils/helper");
const { error } = require("../utils/response");


async function verifyTokenMiddleware(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return error(res, "User Unauthenticated", RESPONSE_CODES.FAILED, 401);
    }

    const token = authHeader.substring(7);

    // 1️ JWT verify (basic signature check)
    const decoded = verifyToken(token);
    if (!decoded) {
      return error(res, "Invalid Bearer Token", RESPONSE_CODES.FAILED, 401);
    }

    // 2️ DB check (unique token ke liye)
    const accessToken = await prisma.user_tokens.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!accessToken) {
      return error(
        res,
        "User already logged out or Token not found  ",
        RESPONSE_CODES.FAILED,
        401
      );
    }

    // 3️ Expiry check
    if (accessToken.expires_at) {
      const now = dayjs();
      const expires = dayjs(accessToken.expires_at);
      if (now.isAfter(expires)) {
        return error(res, "Token expired", RESPONSE_CODES.FAILED, 401);
      }
    }

    // 4️ Status check
    if (accessToken.status === "Inactive") {
      return error(
        res,
        "Unauthorized (Inactive Token)",
        RESPONSE_CODES.FAILED,
        401
      );
    }

    // 5️ Role check
    if (!["Admin", "User"].includes(accessToken.user.role)) {
      return error(res, "Unauthorized Role", RESPONSE_CODES.FAILED, 403);
    }

    // 6️ User id check
    if (!accessToken.user_id) {
      return error(
        res,
        "User id not available in token, user_id is required",
        RESPONSE_CODES.FAILED,
        422
      );
    }

    // ✅ Attach user details to request
    req.user = {
      user_id: accessToken.user_id,
      role: accessToken.user.role,
      token_type: accessToken.token_type,
    };

    return next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return error(res, "Internal Server Error", RESPONSE_CODES.FAILED, 500);
  }
}

module.exports = verifyTokenMiddleware;
