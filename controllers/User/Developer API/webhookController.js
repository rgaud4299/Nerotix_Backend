const prisma = require('@prisma/client').PrismaClient;
const db = new prisma();
const dayjs = require("dayjs");
const { success, error } = require("../../../utils/response");
const { RESPONSE_CODES } = require("../../../utils/helper");
const { safeParseInt, convertBigIntToString } = require('../../../utils/parser');


const utc = require("dayjs/plugin/utc");
const tz = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(tz);
const ISTFormat = (d) => (d ? dayjs(d).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : null);



exports.update = async (req, res) => {

  try {
    const {
      url: rawUrl = "",
      event = "",
      secret_key: rawSecretKey = "",
      status = "active",
    } = req.body;
const user_id = String(req.user?.id || ""); // Always as String
console.log("User ID:", user_id);

const url = (rawUrl || "").trim();
const secret_key = (rawSecretKey || "").trim();

if (!user_id) {
  return error(res, "User ID is required", RESPONSE_CODES.VALIDATION_ERROR, 422);
}

// Allow empty or valid URL only
if (url && !/^(https?:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(url)) {
  return error(res, "Invalid webhook URL", RESPONSE_CODES.VALIDATION_ERROR, 422);
}



// Check if user exists in DB
const existingUser =await db.users.findUnique({
      where: { id: parseInt(user_id) },
    });

if (!existingUser) {
  return error(res, "User not found in database", RESPONSE_CODES.NOT_FOUND, 404);
}

    const updatePayload = { 
      user_id,
      url,
      event,
      secret_key,
      status,
      updated_at: dayjs().toDate(),
    };

    // Upsert (update if exists, else create)
    let webhook = await db.webhooks.findFirst({ where: { user_id } });

    if (webhook) {
      webhook = await db.webhooks.update({
        where: { id: webhook.id },   
        data: updatePayload,
      });
    } else {
      webhook = await db.webhooks.create({
        data: { ...updatePayload, created_at: dayjs().toDate() },
      });
    }

    const formattedWebhook = convertBigIntToString({
      id: webhook.id,
      user_id: webhook.user_id,
      url: webhook.url,
      event: webhook.event,
      secret_key: webhook.secret_key,
      status: webhook.status,
      created_at: webhook.created_at ? ISTFormat(webhook.created_at) : null,
      updated_at: ISTFormat(webhook.updated_at),
    });

    return success(res, "Webhook saved successfully", formattedWebhook);
  } catch (err) {
    console.error("updateWebhook error:", err);
    return error(res, "Failed to save webhook", RESPONSE_CODES.FAILED, 500);
  }
};


