const express = require("express");
const router = express.Router();
const validators = require("../validators/pgValidators");
const createSecuredRoutes = require('../utils/createSecuredRoutes');


const {
  initiatePayment,
  getPaymentStatus,
  initiateRefund,
  getRefundStatus,
  paymentWebhook
} = require("../controllers/User/pgControllerApi/pgController");
const authMiddleware = require('../middleware/auth');



// const securedRoutes = createSecuredRoutes(authMiddleware, (router) => {
// Payment Routes
router.post("/payment/initiate", validators.initiatePaymentValidator, initiatePayment);
router.get("/payment/status/:merchantOrderId", validators.getPaymentStatusValidator, getPaymentStatus);
router.post("/payment/webhook",validators.paymentWebhookValidator, paymentWebhook);

// Refund Routes
router.post("/refund/initiate", validators.initiateRefundValidator , initiateRefund);
router.get("/refund/status/:merchantRefundId",validators.getRefundStatusValidator, getRefundStatus);

// });

// router.use('/', securedRoutes);

module.exports = router;
