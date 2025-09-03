const { randomUUID } = require("crypto");
const { StandardCheckoutPayRequest, RefundRequest } = require("pg-sdk-node");
const client = require("../../../utils/Helper/Phonepay");
const { success, error } = require("../../../utils/response");
const { RESPONSE_CODES } = require("../../../utils/helper");


// Initiate Payment
exports.initiatePayment = async (req, res) => {
  try {

    const userId = req.user?.user_id;

    const { amount } = req.body;
    if (!amount) {
      return error(res, "Amount is required", RESPONSE_CODES.VALIDATION_ERROR, 422);
    }

    const merchantOrderId = randomUUID();

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amount * 100)
      .redirectUrl("https://yourapp.com/payment/redirect")
      .build();

    console.log("Payment Initiate Request:", { userId, request });

    const response = await client.pay(request);

    return success(res, "Payment initiated successfully", {
      userId,
      // merchantOrderId,
      checkoutUrl: response.redirectUrl,
    });
  } catch (err) {
    console.error("Payment Initiate Error:", err);
    return error(res, "Failed to initiate payment", RESPONSE_CODES.SERVER_ERROR, 500);
  }
};


// Get Payment Status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { merchantOrderId } = req.params;
    const includeDetails = req.query.details === "true";

    if (!merchantOrderId) {
      return error(res, "merchantOrderId is required", RESPONSE_CODES.VALIDATION_ERROR, 422);
    }

    const response = await client.getOrderStatus(merchantOrderId, { details: includeDetails });

    return success(res, "Payment status fetched successfully", {
      order_id: response.orderId,
      state: response.state,
      amount: response.amount,
      expireAt: response.expireAt,
      metaInfo: response.metaInfo,
      payment_details: response.paymentDetails,
      split_instruments: response.splitInstruments,
    });
  } catch (err) {
    console.error("Order Status Error:", err);
    return error(res, "Failed to fetch payment status", RESPONSE_CODES.SERVER_ERROR, 500);
  }
};

// Initiate Refund
exports.initiateRefund = async (req, res) => {
  try {
    const { originalMerchantOrderId, amount } = req.body;

    if (!originalMerchantOrderId || !amount) {
      return error(
        res,
        "originalMerchantOrderId and amount are required",
        RESPONSE_CODES.VALIDATION_ERROR,
        422
      );
    }

    const merchantRefundId = randomUUID();

    const request = RefundRequest.builder()
      .originalMerchantOrderId(originalMerchantOrderId)
      .merchantRefundId(merchantRefundId)
      .amount(amount)
      .build();

    const response = await client.refund(request);

    return success(res, "Refund initiated successfully", {
      refundId: response.refundId,
      merchantRefundId,
      state: response.state,
      amount: response.amount,
    });
  } catch (err) {
    console.error("Refund Initiate Error:", err);
    return error(res, "Failed to initiate refund", RESPONSE_CODES.SERVER_ERROR, 500);
  }
};

// Get Refund Status
exports.getRefundStatus = async (req, res) => {
  try {
    const { merchantRefundId } = req.params;

    if (!merchantRefundId) {
      return error(res, "merchantRefundId is required", RESPONSE_CODES.VALIDATION_ERROR, 422);
    }

    const response = await client.getRefundStatus(merchantRefundId);

    return success(res, "Refund status fetched successfully", response);
  } catch (err) {
    console.error("Refund Status Error:", err);
    return error(res, "Failed to fetch refund status", RESPONSE_CODES.SERVER_ERROR, 500);
  }
};

// Payment Webhook
exports.paymentWebhook = async (req, res) => {
  try {
    const { type, payload } = req.body;

    console.log("Webhook Headers:", req.headers);
    console.log("Webhook Body:", req.body);

    if (type === "CHECKOUT_ORDER_COMPLETED") {
      console.log("Payment Completed:", payload.merchantOrderId);
    } else if (type === "CHECKOUT_ORDER_FAILED") {
      console.log("Payment Failed:", payload.merchantOrderId);
    } else if (type?.startsWith("PG_REFUND")) {
      console.log("Refund Event:", payload.merchantRefundId, payload.state);
    }

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook Error:", err);
    return error(res, "Webhook processing failed", RESPONSE_CODES.SERVER_ERROR, 400);
  }
};
