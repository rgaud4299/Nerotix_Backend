const express = require('express');
const router = express.Router();
const createSecuredRoutes = require('../utils/createSecuredRoutes');
const serviceSwitchingController = require('../controllers/serviceSwitchingController');
const authMiddleware  = require('../middleware/auth');

const {
  addServiceSwitchingValidation,
  updateServiceSwitchingValidation,
  changeServiceSwitchingStatusValidation,
  deleteServiceSwitchingValidation
} = require('../validators/serviceSwitchingValidator');

const { apiCreate ,apiChangeStatus,apiSoftDelete,getAllApis,updateApi,updatekeyvalue} = require("../controllers/addApiController");
const { addApiValidation,updateAuthValidation ,updatekeyvalueValidation} = require("../validators/AddApisValidator");


const securedRoutes = createSecuredRoutes(authMiddleware, (router) => {
  // Add Service Switching
  router.post('/service-switching/add', addServiceSwitchingValidation, serviceSwitchingController.addServiceSwitching);
  router.post('/service-switching/get-list', serviceSwitchingController.getServiceSwitchingList);
  router.put('/service-switching/update/:id', updateServiceSwitchingValidation, serviceSwitchingController.updateServiceSwitching);
  router.get('/service-switching/byid/:id', serviceSwitchingController.getServiceSwitchingById);
  router.delete('/service-switching/delete/:id', deleteServiceSwitchingValidation, serviceSwitchingController.deleteServiceSwitching);
  router.put('/service-switching/change-status/:id', changeServiceSwitchingStatusValidation, serviceSwitchingController.changeServiceSwitchingStatus);

});


router.post('/apis/add', addApiValidation,apiCreate);
router.patch("/apis/changeStatus/:id", apiChangeStatus);
router.delete("/apis/delete/:id", apiSoftDelete);
router.get("/apis/get-api", getAllApis);
router.patch("/apis/update/:id", updateAuthValidation, updateApi);
router.patch('/apis/add-keys/:id', updatekeyvalueValidation,updatekeyvalue );

router.use('/', securedRoutes);

module.exports = router;
