const express = require("express");
const router = express.Router();
const userIpWhitelistController = require("../controllers/userIpWhitelistController");
const { addIpValidation ,
  changeStatusValidation,
  deleteIpValidation,getAllIpValidation} = require("../validators/userIpWhitelistValidator");
const ctrl = require('../controllers/webhookController');
const validate = require('../validators/webhookValidator');
const controller = require("../controllers/userTokensController");
const { generateTokenValidation, TokenchangeStatusValidation } = require("../validators/userTokensValidation");


// all whitelisted IPs
router.post("/whitelisted/add",addIpValidation, userIpWhitelistController.addIp);  // Add new whitelist entry
router.get("/whitelisted/get-list/:user_id", getAllIpValidation,userIpWhitelistController.getAllIp);      // GET all whitelisted IPs
router.put("/whitelisted/changestatus/:id", changeStatusValidation,userIpWhitelistController.changeStatus);          // Update whitelist entry
router.delete("/whitelisted/delete/:id",deleteIpValidation, userIpWhitelistController.deleteIp);       // Delete whitelist entry
 
// webhook
router.put('/webhook/update',validate.update, ctrl.update);

// userTokens
router.post("/userTokens/generate", generateTokenValidation, controller.generateToken);
router.put("/userTokens/status/:id", TokenchangeStatusValidation, controller.changeTokenStatus);


module.exports = router;
