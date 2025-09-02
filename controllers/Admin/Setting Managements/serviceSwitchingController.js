const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { logAuditTrail } = require('../../../services/auditTrailService');
const { RESPONSE_CODES, normalizeStatus } = require('../../../utils/helper');
const { getNextSerial, reorderSerials } = require('../../../utils/serial');
const { success, error, successGetAll } = require('../../../utils/response');
const { safeParseInt, convertBigIntToString } = require('../../../utils/parser');




dayjs.extend(utc);
dayjs.extend(timezone);

const VALID_STATUS = ['Active', 'Inactive'];

// Add Service Switching
exports.addServiceSwitching = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, errors.array()[0].msg, RESPONSE_CODES.VALIDATION_ERROR, 422);

  const api_id = BigInt(safeParseInt(req.body.api_id));
  const product_id = BigInt(safeParseInt(req.body.product_id));
  const { api_code, rate, commission_surcharge, flat_per, gst, tds, txn_limit, status } = req.body;

  try {
    const [apiExists, productExists, existing] = await Promise.all([
      prisma.apis.findUnique({ where: { id: api_id } }),
      prisma.products.findUnique({ where: { id: product_id } }),
      prisma.service_switchings.findFirst({ where: { api_id, product_id } })
    ]);

    if (!apiExists) return error(res, 'API ID does not exist', RESPONSE_CODES.NOT_FOUND, 404);
    if (!productExists) return error(res, 'Product ID does not exist', RESPONSE_CODES.NOT_FOUND, 404);
    if (existing) return error(res, 'Service Switching for this API and Product already exists', RESPONSE_CODES.DUPLICATE, 409);

    const dateObj = dayjs().tz('Asia/Kolkata').toDate();

    const newData = await prisma.service_switchings.create({
      data: {
        api_id,
        product_id,
        api_code: String(api_code),
        rate: String(rate),
        commission_surcharge: String(commission_surcharge),
        flat_per: String(flat_per),
        gst: Number(gst),
        tds: Number(tds),
        txn_limit: Number(txn_limit),
        status,
        created_at: dateObj,
        updated_at: dateObj
      }
    });

    logAuditTrail({
      table_name: 'service_switchings',
      row_id: newData.id,
      action: 'create',
      user_id: req.user?.id || null,
      ip_address: req.ip,
      remark: `Service Switching created for API Code ${api_code}`,
      created_by: req.user?.id || null,
      status: 'Created'
    }).catch(err => console.error('Audit log error:', err));

    return success(res, 'Service Switching Added Successfully');

  } catch (err) {
    console.error('Add Service Switching Error:', err);
    return error(res, 'Failed to add Service Switching', RESPONSE_CODES.FAILED, 500);
  }
};

// List Service Switching
exports.getServiceSwitchingList = async (req, res) => {
  const offset = safeParseInt(req.body.offset, 0);
  const limit = safeParseInt(req.body.limit, 10);
  const product_id = req.body.product_id ? BigInt(safeParseInt(req.body.product_id)) : null;
  const apiId = req.body.apiId ? BigInt(safeParseInt(req.body.apiId)) : null;
  const statusFilter = (req.body.status && VALID_STATUS.includes(req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1).toLowerCase()))
    ? req.body.status.charAt(0).toUpperCase() + req.body.status.slice(1).toLowerCase()
    : null;

  const skip = offset * 10;

  try {
    const where = { AND: [product_id ? { product_id } : null, apiId ? { api_id: apiId } : null, statusFilter ? { status: statusFilter } : null].filter(Boolean) };

    const [total, filteredCount] = await Promise.all([
      prisma.service_switchings.count(),
      prisma.service_switchings.count({ where })
    ]);

    const data = await prisma.service_switchings.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'asc' },
      include: { apis: true, products: true }
    });

    const formattedData = convertBigIntToString(data).map((item, index) => {
      let purchaseText = '';
      if (item.flat_per === 'flat') purchaseText = `Surcharge @ ${item.commission_surcharge} ₹/Txn`;
      if (item.flat_per === 'percent') purchaseText = ` Commission @ ${item.commission_surcharge} %`;

      return {
        id: item.id.toString(),
        serial_no: skip + index + 1,
        api_name: item.apis?.api_name || '',   // yaha bhi msg_apis -> apis
        product: item.products?.name || '',
        apiServiceCode: item.api_code || '0',
        purchase: purchaseText,
        limit: item.txn_limit,
        status: item.status
      };
    });


    return successGetAll(res, 'Data fetched successfully', formattedData, total, filteredCount,);

  } catch (err) {
    console.error(err);
    return error(res, 'Server error', RESPONSE_CODES.FAILED, 500);
  }
};

// Get Service Switching by ID
exports.getServiceSwitchingById = async (req, res) => {
  const id = BigInt(safeParseInt(req.params.id));
  if (!id) return error(res, 'Service Switching ID is required', RESPONSE_CODES.VALIDATION_ERROR, 422);

  try {
    const data = await prisma.service_switchings.findUnique({
      where: { id },
      include: {
        apis: { select: { api_name: true } },   // ✅ apis
        products: { select: { name: true } }    // ✅ products
      }
    });

    if (!data) return error(res, 'Service Switching not found', RESPONSE_CODES.NOT_FOUND, 404);

    // BigInt → String convert
    const formattedData = convertBigIntToString(data);

    // Flatten relations
    const responseData = {
      ...formattedData,
      api_name: data.apis?.api_name || null,
      product_name: data.products?.name || null
    };

    // Remove nested objects
    delete responseData.apis;
    delete responseData.products;

    return res.status(200).json({
      success: true,
      statusCode: 1,
      message: 'Data fetched successfully',
      data: responseData
    });

  } catch (err) {
    console.error(err);
    return error(res, 'Server error', RESPONSE_CODES.FAILED, 500);
  }
};


// Update Service Switching
exports.updateServiceSwitching = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return error(res, errors.array()[0].msg, RESPONSE_CODES.VALIDATION_ERROR, 422);

  const id = BigInt(safeParseInt(req.params.id));
  const api_id = BigInt(safeParseInt(req.body.api_id));
  const product_id = BigInt(safeParseInt(req.body.product_id));
  const { api_code, rate, commission_surcharge, flat_per, gst, tds, txn_limit, status } = req.body;

  try {
    const existing = await prisma.service_switchings.findUnique({ where: { id } });
    if (!existing) return error(res, 'Service Switching Not Found', RESPONSE_CODES.NOT_FOUND, 404);

    const duplicate = await prisma.service_switchings.findFirst({
      where: { api_id, product_id, NOT: { id } }
    });
    if (duplicate) return error(res, 'This Service Switching already exists', RESPONSE_CODES.DUPLICATE, 409);

    const updatedAt = dayjs().tz('Asia/Kolkata').toDate();

    await prisma.service_switchings.update({
      where: { id },
      data: {
        api_id,
        product_id,
        api_code: String(api_code),
        rate: String(rate),
        commission_surcharge: String(commission_surcharge),
        flat_per: String(flat_per),
        gst: Number(gst),
        tds: Number(tds),
        txn_limit: Number(txn_limit),
        status,
        updated_at: updatedAt
      }
    });

    logAuditTrail({
      table_name: 'service_switchings',
      row_id: id,
      action: 'update',
      user_id: req.user?.id || null,
      ip_address: req.ip,
      remark: ` Service Switching updated for API Code ${api_code}`,
      updated_by: req.user?.id || null,
      status: 'Updated'
    }).catch(err => console.error('Audit log error:', err));

    return success(res, 'Service Switching Updated Successfully');

  } catch (err) {
    console.error(err);
    return error(res, 'Server error', RESPONSE_CODES.FAILED, 500);
  }
};

// Delete Service Switching
exports.deleteServiceSwitching = async (req, res) => {
  const id = BigInt(safeParseInt(req.params.id));
  if (!id) return error(res, 'Service Switching Id is required', RESPONSE_CODES.VALIDATION_ERROR, 422);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.service_switchings.delete({ where: { id } });
      await reorderSerials(tx, 'service_switchings');
    });

    logAuditTrail({
      table_name: 'service_switchings',
      row_id: id,
      action: 'delete',
      user_id: req.user?.id || null,
      ip_address: req.ip,
      remark: `Service Switching deleted`,
      status: 'Deleted',
      deleted_by: req.user?.id || null,
    }).catch(err => console.error('Audit log error:', err));

    return success(res, 'Service Switching Deleted Successfully');

  } catch (err) {
    console.error(err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return error(res, 'Service Switching Not Found', RESPONSE_CODES.NOT_FOUND, 404);
    }
    return error(res, 'Server error', RESPONSE_CODES.FAILED, 500);
  }
};



// Change Service Switching Status (only one active per product)
exports.changeServiceSwitchingStatus = async (req, res) => {
  const id = BigInt(safeParseInt(req.params.id));
  const { status } = req.body;

  try {
    const existing = await prisma.service_switchings.findUnique({ where: { id } });
    if (!existing) {
      return error(res, 'Service Switching Not Found', RESPONSE_CODES.NOT_FOUND, 404);
    }

    const updatedAt = dayjs().tz('Asia/Kolkata').toDate();

    const normalizedStatus = normalizeStatus(status);
    if (!normalizedStatus) {
      return error(res, 'Status must be Active or Inactive', RESPONSE_CODES.VALIDATION_ERROR, 422);
    }


    await prisma.$transaction(async (tx) => {
      if (normalizedStatus === 'Active') {   // or "ACTIVE"
        await tx.service_switchings.updateMany({
          where: { product_id: existing.product_id },
          data: { status: 'Inactive', updated_at: updatedAt }  // or "INACTIVE"
        });
      }

      await tx.service_switchings.update({
        where: { id },
        data: { status: normalizedStatus, updated_at: updatedAt }
      });
    });
    logAuditTrail({
      table_name: 'service_switchings',
      row_id: id,
      action: 'update',
      user_id: req.user?.id || null,
      ip_address: req.ip,
      remark: ` Service Switching status changed to ${status.toUpperCase()}`,
      updated_by: req.user?.id || null,
      status
    }).catch(err => console.error('Audit log error:', err));

    return success(res, `Service Switching status updated to ${status.toUpperCase()}`);

  } catch (err) {
    console.error(err);
    return error(res, 'Server error', RESPONSE_CODES.FAILED, 500);
  }
};
