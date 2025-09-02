const express = require('express');
const router = express.Router();
const createSecuredRoutes = require('../utils/createSecuredRoutes');
const serviceSwitchingController = require('../controllers/Admin/Setting Managements/serviceSwitchingController');
const authMiddleware = require('../middleware/auth');
const {authorizeRole}=require('../middleware/authorizeRole')

const {
  addServiceSwitchingValidation,
  updateServiceSwitchingValidation,
  changeServiceSwitchingStatusValidation,
  deleteServiceSwitchingValidation
} = require('../validators/serviceSwitchingValidator');

const { apiCreate, apiChangeStatus, apiSoftDelete, getAllApis, updateApi, updatekeyvalue } = require("../controllers/Admin/Setting Managements/addApiController");
const { addApiValidation, updateAuthValidation, updatekeyvalueValidation, IdParamValidation } = require("../validators/AddApisValidator");


const securedRoutes = createSecuredRoutes([authMiddleware], (router) => {
  // Add Service Switching
  router.post('/service-switching/add', addServiceSwitchingValidation, serviceSwitchingController.addServiceSwitching);
  router.post('/service-switching/get-list', serviceSwitchingController.getServiceSwitchingList);
  router.put('/service-switching/update/:id', updateServiceSwitchingValidation, serviceSwitchingController.updateServiceSwitching);
  router.get('/service-switching/byid/:id', serviceSwitchingController.getServiceSwitchingById);
  router.delete('/service-switching/delete/:id', deleteServiceSwitchingValidation, serviceSwitchingController.deleteServiceSwitching);
  router.patch('/service-switching/change-status/:id', changeServiceSwitchingStatusValidation, serviceSwitchingController.changeServiceSwitchingStatus);

  router.post('/apis/add', addApiValidation, apiCreate);
  router.patch("/apis/changeStatus/:id", IdParamValidation, apiChangeStatus);
  router.delete("/apis/delete/:id", IdParamValidation, apiSoftDelete);
  router.post("/apis/get-api", getAllApis);
  router.patch("/apis/update/:id", IdParamValidation, updateAuthValidation, updateApi);
  router.patch('/apis/add-keys/:id', IdParamValidation, updatekeyvalueValidation, updatekeyvalue);
});

router.use('/', securedRoutes);

module.exports = router;
