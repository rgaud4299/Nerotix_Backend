const walletController = require("../controllers/User/walletController Api/walletController");
const express = require("express");
const router = express.Router();


// wallet
router.get('/wallet',  walletController.getWalletByUserId); 




module.exports = router;