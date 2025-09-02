const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const dayjs = require("dayjs");
const { success, error } = require("../../../utils/response");
const { RESPONSE_CODES } = require("../../../utils/helper");
const { logAuditTrail } = require("../../../services/auditTrailService");
const { safeParseInt, convertBigIntToString } = require('../../../utils/parser');
const ISTFormat = (d) => (d ? dayjs(d).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : null);


const utc = require("dayjs/plugin/utc");
const tz = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(tz);



// Add new IP
exports.addIp = async (req, res) => {
  const {  ip_address } = req.body;
const user_id = String(req.user?.user_id || ""); // Always as String

  try {
   
    const existingUser =await prisma.users.findUnique({
          where: { id: parseInt(user_id) },
        });
    
    if (!existingUser) {
      return error(res, "User not found in database", RESPONSE_CODES.NOT_FOUND, 404);
    }
    
    const count = await prisma.user_ip_whitelist.count({
      where: { user_id },
    });

    if (count >= 3) {
      return error(
        res,
        "Maximum 3 IP addresses allowed per user",
        RESPONSE_CODES.VALIDATION_ERROR,
        429
      );
    }

    const exists = await prisma.user_ip_whitelist.findFirst({
      where: { user_id, ip_address },
    });

    if (exists) {
      return error(
        res,
        "This IP is already whitelisted for this user",
        RESPONSE_CODES.DUPLICATE,
        409
      );
    }

    const newIp = await prisma.user_ip_whitelist.create({
      data: {
        user_id,
        ip_address,
        status: "Inactive",
        created_at: dayjs().toDate(),
        updated_at: dayjs().toDate(),
      },
    });

    const formattedIP = convertBigIntToString({
      id: newIp.id,
      user_id: newIp.user_id,
      ip_address: newIp.ip_address,
      status: newIp.status,
      created_at: newIp.created_at ? ISTFormat(newIp.created_at) : null,
      updated_at: ISTFormat(newIp.updated_at),
    });

    return success(res, "IP address saved successfully", formattedIP);
  } catch (err) {
    console.error(err);
    return error(res, "Failed to add IP");
  }
};



exports.getAllIp = async (req, res) => {

  try {
    const user_id = String(req.user?.user_id || ""); // Always as String

   if (!user_id) {
      return error(res, "User ID is required", RESPONSE_CODES.VALIDATION_ERROR, 422);
    }
    // 1️⃣ Check if user already has 3 IPs
    // Check if user exists in DB
    const existingUser =await prisma.users.findUnique({
          where: { id: parseInt(user_id) },
        });
    
    if (!existingUser) {
      return error(res, "User not found in database", RESPONSE_CODES.NOT_FOUND, 404);
    }
   

    // get all IPs for this user
    const ipList = await prisma.user_ip_whitelist.findMany({
      where: { user_id },
      orderBy: { created_at: "desc" }
    });

    if (!ipList || ipList.length === 0) {
      return error(res, "No IPs found for this user", RESPONSE_CODES.NOT_FOUND, 404);
    }
      const total = await prisma.user_ip_whitelist.count({
      where: { user_id },
    });
    
    // format data
    const formatted = ipList.map((ip,index) => convertBigIntToString({
      id: ip.id,
      serial_no:index+1,
      user_id: ip.user_id,
      ip_address: ip.ip_address,
      status: ip.status,
      created_at: ip.created_at ? ISTFormat(ip.created_at) : null,
      updated_at: ip.updated_at ? ISTFormat(ip.updated_at) : null,
    }));

     return res.status(200).json({
      success: true,
      statusCode: 1,
      message: 'Data fetched successfully',
      recordsTotal: total,
      data: formatted
    });

  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch IP list", RESPONSE_CODES.SERVER_ERROR, 500);
  }
};


// Change status
exports.changeStatus = async (req, res) => {

  const { id } = req.params;
  const { status } = req.body;

  try {
    const ip = await prisma.user_ip_whitelist.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ip) {
      return error(res, "IP not found", RESPONSE_CODES.NOT_FOUND, 404);
    }

    const updated = await prisma.user_ip_whitelist.update({
      where: { id: parseInt(id) },
      data: {
        status,
        updated_at: dayjs().toDate(),
      },
    });

    const formattedIP = convertBigIntToString({
      id: updated.id,
      user_id: updated.user_id,
      ip_address: updated.ip_address,
      status: updated.status,
      created_at: updated.created_at ? ISTFormat(updated.created_at) : null,
      updated_at: ISTFormat(updated.updated_at),
    });

    return success(res, "IP status updated successfully", formattedIP);

  } catch (err) {
    console.error(err);
    return error(res, "Failed to update IP status");
  }
};



// Delete IP
exports.deleteIp = async (req, res) => {


  const { id } = req.params;

  try {
    const ip = await prisma.user_ip_whitelist.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ip) {
      return error(res, "Invalid IP ID", RESPONSE_CODES.NOT_FOUND, 404);
    }

    await prisma.user_ip_whitelist.delete({
      where: { id: parseInt(id) },
    });

    return success(res, "IP deleted successfully");
  } catch (err) {
    console.error(err);
    return error(res, "Failed to delete IP");
  }
};













