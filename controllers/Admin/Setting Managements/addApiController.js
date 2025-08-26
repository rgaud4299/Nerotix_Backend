
const prisma = require('@prisma/client').PrismaClient;
const db = new prisma();
const dayjs = require("dayjs");
const { success, error } = require("../../../utils/response");
const { RESPONSE_CODES } = require("../../../utils/helper");
const { logAuditTrail } = require("../../../services/auditTrailService");
const { safeParseInt, convertBigIntToString } = require('../../../utils/parser');


const utc = require("dayjs/plugin/utc");
const tz = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(tz);
const ISTFormat = (d) => (d ? dayjs(d).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : null);




exports.apiCreate = async (req, res) => {
   try {
    const { api_name } = req.body;

    // check if api_name already exists
    const existingApi = await db.apis.findFirst({
      where: { api_name }
    });

    if (existingApi) {
      if (existingApi.deleted === "No") {
        return error(res, "API already exists with this name", 4,409);
      } else if (existingApi.deleted === "Yes") {
        return error(res, "API already exists but in deleted status Yes", 4,409);
      }
    }

    const newApi = await db.apis.create({
      data: {
        api_name,
        api_type: "",
        remain_balance: "",
        pending_txn_limit: 0,
        auth_key1: "",
        auth_value1: "",
        auth_key2: "",
        auth_value2: "",
        auth_key3: "",
        auth_value3: "",
        auth_key4: "",
        auth_value4: "",
        auth_key5: "",
        auth_value5: "",
        auth_key6: "",
        auth_value6: "",
        auto_status_check: "Inactive",
        status: "",
        deleted: "No",
        created_at: new Date(),
        updated_at: dayjs().toDate(),
        deleted_at: null
      }
    });

        const formattedApi = convertBigIntToString({
         id: newApi.id,
         api_name: newApi.api_name,
         auto_status_check: newApi.auto_status_check,
         status: newApi.status,
         created_at: newApi.created_at ? ISTFormat(newApi.created_at) : null,
         updated_at: ISTFormat(newApi.updated_at),
         deleted_at: newApi.deleted_at ? ISTFormat(newApi.deleted_at) : null
       });
   
       return success(res, "API saved successfully",formattedApi);
  } catch (err) {
        console.error(err);
       return error(res, "API saved failed", err);
  }
};

exports.apiChangeStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

     // find API first
    const apiRecord = await db.apis.findUnique({ where: { id } });
    if (!apiRecord) {
      return error(res, "API not found");
    }

    // toggle the status
    const newStatus = apiRecord.auto_status_check === "Active" ? "Inactive" : "Active";

    // update
    const updatedApi = await db.apis.update({
      where: { id },
      data: { 
        auto_status_check: newStatus,
        updated_at: dayjs().toDate(),
      }
    });

    // format like your other responses
    const formattedApi = convertBigIntToString({
      id: updatedApi.id,
      serial_no: updatedApi.serial_no,
      api_name: updatedApi.api_name,
      auto_status_check: updatedApi.auto_status_check,
      status: updatedApi.status,
      deleted: updatedApi.deleted,
      created_at: updatedApi.created_at ? ISTFormat(updatedApi.created_at) : null,
      updated_at: ISTFormat(updatedApi.updated_at),
      deleted_at: updatedApi.deleted_at ? ISTFormat(updatedApi.deleted_at) : null
    });

    return success(res, "API status updated successfully");
  } catch (err) {
       console.error(err);
       return error(res, "API status change failed", err);
  }
};

exports.apiSoftDelete = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // find API first
    const apiRecord = await db.apis.findUnique({ where: { id } });
    if (!apiRecord) {
      return error(res, "API not found");
    }

    // if already deleted
    if (apiRecord.deleted === "Yes") {
      return error(res, "API already deleted");
    }

    // soft delete update
    const deletedApi = await db.apis.update({
      where: { id },
      data: {
        deleted: "Yes",
        deleted_at: dayjs().toDate(),
       
      }
    });

    // format response
    const formattedApi = convertBigIntToString({
      id: deletedApi.id,
      serial_no: deletedApi.serial_no,
      api_name: deletedApi.api_name,
      auto_status_check: deletedApi.auto_status_check,
      status: deletedApi.status,
      deleted: deletedApi.deleted,
      created_at: deletedApi.created_at ? ISTFormat(deletedApi.created_at) : null,
      updated_at: ISTFormat(deletedApi.updated_at),
      deleted_at: deletedApi.deleted_at ? ISTFormat(deletedApi.deleted_at) : null
    });

    return success(res, "API  deleted successfully");
  } catch (err) {
    console.error(err);
    return error(res, "API  delete failed", err);
  }
};

exports.getAllApis = async (req, res) => {
  try {
    // fetch only non-deleted apis
    const apis = await db.apis.findMany({
      where: { deleted: "No" },
    //   orderBy: { serial_no: "asc" }
    });

    // count total non-deleted apis
    const total = await db.apis.count({
      where: { deleted: "No" }
    });

    // format each record
    const formattedApis = apis.map(api =>
      convertBigIntToString({
        id: api.id,
        serial_no: api.serial_no,
        api_name: api.api_name,
        auto_status_check: api.auto_status_check,
        status: api.status,
        deleted: api.deleted,
        created_at: api.created_at ? ISTFormat(api.created_at) : null,
        updated_at: ISTFormat(api.updated_at),
        deleted_at: api.deleted_at ? ISTFormat(api.deleted_at) : null
      })
    );

    return success(res, "APIs fetched successfully", total,formattedApis
    );
  } catch (err) {
    console.error(err);
    return error(res, "Failed to fetch APIs", err);
  }
};

exports.updateApi = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
      return error(res, "Invalid API id", 400);
    }

    // Allowed fields
    const allowedFields = [
      "api_name",
      "api_type",
      "remain_balance",
      "pending_txn_limit",
      "auto_status_check",
      "status"
    ];

    //  Check for invalid fields first
    const invalidKeys = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidKeys.length > 0) {
      return error(res, `Invalid field(s): ${invalidKeys.join(", ")}`, 422);
    }

    //  Now only pick allowed fields
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, "No valid fields provided for update", 422);
    }

    updateData.updated_at = new Date();

    const updatedApi = await db.apis.update({
      where: { id },
      data: updateData,
    });

    const formattedApi = convertBigIntToString({
      id: updatedApi.id,
      api_name: updatedApi.api_name,
      auto_status_check: updatedApi.auto_status_check,
      status: updatedApi.status,
      created_at: updatedApi.created_at ? ISTFormat(updatedApi.created_at) : null,
      updated_at: ISTFormat(updatedApi.updated_at),
      deleted_at: updatedApi.deleted_at ? ISTFormat(updatedApi.deleted_at) : null
    });

    return success(res, "API updated successfully", formattedApi);
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update API", err);
  }
};

exports.updatekeyvalue = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
      return error(res, "Invalid API id", 400);
    }

    // Allowed fields (only auth keys/values)
    const allowedFields = [
      "auth_key1", "auth_value1",
      "auth_key2", "auth_value2",
      "auth_key3", "auth_value3",
      "auth_key4", "auth_value4",
      "auth_key5", "auth_value5",
      "auth_key6", "auth_value6"
    ];

    // Invalid key check
    const invalidKeys = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidKeys.length > 0) {
      return error(res, `Invalid field(s): ${invalidKeys.join(", ")}`, 422);
    }

    // Collect only allowed fields
    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return error(res, "No valid fields provided for update", 422);
    }

    updateData.updated_at = new Date();

    const updatedApi = await db.apis.update({
      where: { id },
      data: updateData,
    });

    // Format response
   // Format response with only updated fields
const formattedApi = convertBigIntToString({
  id: updatedApi.id,
  ...Object.fromEntries(
    Object.keys(updateData).map((field) => [field, updatedApi[field]])
  ),
  updated_at: ISTFormat(updatedApi.updated_at),
});


    return success(res, "Auth fields updated successfully", formattedApi);
  } catch (err) {
    console.error(err);
    return error(res, "Failed to update Auth fields", err);
  }
};

