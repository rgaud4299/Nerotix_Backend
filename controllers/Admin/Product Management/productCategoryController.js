const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');
const slugify = require('slugify');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { logAuditTrail } = require('../../../services/auditTrailService');
const { RESPONSE_CODES } = require('../../../utils/helper');
const { getNextSerial, reorderSerials } = require('../../../utils/serial');
const { success, error, successGetAll } = require('../../../utils/response');
const { safeParseInt, convertBigIntToString } = require('../../../utils/parser');

dayjs.extend(utc);
dayjs.extend(timezone);

// const VALID_STATUS = ['Active', 'Inactive'];

function formatISTDate(date) {
    return date ? dayjs(date).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss') : null;
}

// Add Product Category
exports.addProductCategory = async (req, res) => {

    const { name, status } = req.body;

    try {
        const existingCategory = await prisma.product_categories.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } },
        });
        if (existingCategory) return error(res, 'This Product Category already exists', RESPONSE_CODES.DUPLICATE, 409);

        const slug = slugify(name, { lower: true });
        const dateObj = dayjs().tz('Asia/Kolkata').toDate();

        const newCategory = await prisma.product_categories.create({
            data: { name, slug, status, created_at: dateObj },
        });

        logAuditTrail({
            table_name: 'product_categories',
            row_id: newCategory.id,
            action: 'create',
            user_id: req.user?.id ? Number(req.user.id) : null,
            ip_address: req.ip,
            remark: `Product category "${name}" created`,
            created_by: req.user?.id || null,
            status,
        }).catch(err => console.error('Audit log failed:', err));

        return success(
            res,
            'Product Category added successfully',
        );

    } catch (err) {
        console.error(err);
        return error(res, 'Failed to add Product Category');
    }
};

// Get list
exports.getProductCategoryList = async (req, res) => {
    try {
   
        const offset = safeParseInt(req.body.offset, 0);
        const limit = safeParseInt(req.body.limit, 10);
        const searchValue = (req.body.searchValue || '').trim();
        const validStatuses = ['Active', 'Inactive'];
        const statusFilter = (req.body.ProductCategoryStatus || '').toLowerCase();
        const skip = offset * 10;

        const where = {
            AND: [
                searchValue
                    ? { name: { contains: searchValue, mode: 'insensitive' } }
                    : null,
                statusFilter && validStatuses.includes(statusFilter)
                    ? { status: { equals: statusFilter === 'Inactive' ? 'Active' : 'Inactive', mode: 'insensitive' } }
                    : null
            ].filter(Boolean),
        };


        const [total, filteredCount, data] = await Promise.all([
            prisma.product_categories.count(),
            prisma.product_categories.count({ where }),
            prisma.product_categories.findMany({
                where,
                skip,
                take: limit,
                // orderBy: { id: 'asc' },
            }),
        ]);

        const safeData = data;
        const formattedData = safeData.map((item, index) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            status: item.status,
            created_at: formatISTDate(item.created_at),
            updated_at: formatISTDate(item.updated_at),
            serial_no: skip + index + 1,
        }));

      
        return successGetAll(
            res,
            'Data fetched successfully',
            formattedData,
            total,
            filteredCount
        );
    } catch (err) {
        console.error('getProductCategoryList error:', err);
        return error(res, 'Server error', RESPONSE_CODES.FAILED, 500);
    }
};


exports.getProductCategoryById = async (req, res) => {
    const id = req.params.id;

    try {
        const category = await prisma.product_categories.findUnique({
            where: { id },
            select: { id: true, name: true, status: true, created_at: true, updated_at: true },
        });
        if (!category) return error(res, 'Product Category not found', RESPONSE_CODES.NOT_FOUND, 404);
        console.log("category", category);

        return success(res, 'Data fetched successfully', category);
    } catch (err) {
        console.error(err);
        return error(res, 'Server error');
    }
};


exports.updateProductCategory = async (req, res) => {
 
    const id = req.params.id;
    const { name, status } = req.body;

    if (!id || isNaN(id) || id <= 0) return error(res, 'Invalid or missing Product Category ID', RESPONSE_CODES.VALIDATION_ERROR, 422);

    try {
        const category = await prisma.product_categories.findUnique({ where: { id } });
        if (!category) return error(res, 'Product Category not found', RESPONSE_CODES.NOT_FOUND, 404);

        const duplicateName = await prisma.product_categories.findFirst({
            where: { name: { equals: name, mode: 'insensitive' }, id: { not: id } },
        });
        if (duplicateName) return error(res, 'This Product Category already exists', RESPONSE_CODES.DUPLICATE, 409);

        const slug = `${slugify(name, { lower: true })}-${Date.now()}`;
        const updatedAt = dayjs().tz('Asia/Kolkata').toDate();

        await prisma.product_categories.update({
            where: { id },
            data: { name, slug, status, updated_at: updatedAt },
        });

        logAuditTrail({
            table_name: 'product_categories',
            row_id: id,
            action: 'update',
            user_id: req.user?.id ? Number(req.user.id) : null,
            ip_address: req.ip,
            remark: `Product category "${name}" updated`,
            updated_by: req.user?.id || null,
            status,
        }).catch(err => console.error('Audit log failed:', err));

        return success(res, 'Product Category updated successfully');
    } catch (err) {
        console.error(err);
        return error(res, 'Server error');
    }
};

// Delete category
exports.deleteProductCategory = async (req, res) => {
    let { id } = req.params;

    try {

        // 🔎 Check if category exists
        const category = await prisma.product_categories.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!category) {
            return error(
                res,
                "Product Category Not Found",
                RESPONSE_CODES.NOT_FOUND,
                404
            );
        }

        // 🔎 Check if category has assigned products
        const relatedProducts = await prisma.products.count({
            where: { category_id: id },
        });

        if (relatedProducts > 0) {
            return error(
                res,
                "Cannot delete Product Category with assigned products",
                RESPONSE_CODES.FAILED,
                400
            );
        }

        // ✅ Safe delete in transaction
        await prisma.$transaction(async (tx) => {
            await tx.product_categories.delete({ where: { id } });

            logAuditTrail({
                table_name: "product_categories",
                row_id: id,
                action: "delete",
                user_id: req.user?.id ? Number(req.user.id) : null,
                ip_address: req.ip,
                remark: `Product category deleted`,
                deleted_by: req.user?.id || null,
                status: "DELETED",
            }).catch((err) => console.error("Audit log failed:", err));
        });

        return success(res, "Product Category deleted successfully");
    } catch (err) {
        console.error("❌ deleteProductCategory Error:", err);
        return error(res, "Something went wrong", RESPONSE_CODES.SERVER_ERROR, 500);
    }
};



exports.changeProductCategoryStatus = async (req, res) => {
    const id = req.params.id;

    try {
        // Fetch existing category from DB
        const existingCategory = await prisma.product_categories.findUnique({ where: { id } });
        if (!existingCategory) {
            return error(res, 'Product Category Not Found', RESPONSE_CODES.NOT_FOUND, 404);
        }

        const newStatus = existingCategory.status === 'Active' ? 'Inactive' : 'Active';

        // Update the status n the database
        await prisma.product_categories.update({
            where: { id },
            data: { status: newStatus, updated_at: new Date() }, // updated_at optional
        });

        // Log audit trail
        logAuditTrail({
            table_name: 'product_categories',
            row_id: id,
            action: 'update',
            user_id: req.user?.id ? Number(req.user.id) : null,
            ip_address: req.ip,
            remark: `Status toggled to ${newStatus}`,
            updated_by: req.user?.id || null,
            status: newStatus,
        }).catch(err => console.error('Audit log failed:', err));

        return success(res, `Product Category status changed to ${newStatus}`);
    } catch (err) {
        console.error(err);
        return error(res, 'Server error');
    }
};
