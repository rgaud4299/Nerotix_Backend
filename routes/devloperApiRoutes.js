const express = require("express");
const router = express.Router();
const userIpWhitelistController = require("../controllers/User/Developer API/userIpWhitelistController");
const { addIpValidation ,
  changeStatusValidation,
  deleteIpValidation,getAllIpValidation} = require("../validators/userIpWhitelistValidator");
const ctrl = require('../controllers/User/Developer API/webhookController');
const validate = require('../validators/webhookValidator');
const controller = require("../controllers/User/Developer API/userTokensController");
const { generateTokenValidation, TokenchangeStatusValidation } = require("../validators/userTokensValidation");
const createSecuredRoutes = require("../utils/createSecuredRoutes");
const authMiddleware = require('../middleware/auth');
const { authorizeRole } = require("../middleware/authorizeRole");
const { generateTokenOTP } = require("../controllers/User/Developer API/utils/generateTokenOtp");



const securedRoutes = createSecuredRoutes([authMiddleware], (router) => {
 // all whitelisted IPs
router.post("/whitelisted-ip/add",addIpValidation, userIpWhitelistController.addIp);  // Add new whitelist entry
router.get("/whitelisted-ip/get-list", userIpWhitelistController.getAllIp);      // GET all whitelisted IPs
router.put("/whitelisted-ip/change-status/:id", changeStatusValidation,userIpWhitelistController.changeStatus);          // Update whitelist entry
router.delete("/whitelisted-ip/delete/:id",deleteIpValidation, userIpWhitelistController.deleteIp);       // Delete whitelist entry
// webhook
router.put('/webhook/update',validate.update, ctrl.update);
router.get('/webhook/get-webhook', ctrl.getWebhook);

// userTokens
router.post("/tokens/generate", generateTokenValidation, controller.generateToken);
router.get("/tokens/get-list", controller.getTokensByUserId);
router.put("/tokens/status/:id", TokenchangeStatusValidation, controller.changeTokenStatus);

router.get("/tokens/send-otp",generateTokenOTP);
router.post("/tokens/verify-otp", controller.generateToken);

});


router.use('/', securedRoutes);



module.exports = router;
