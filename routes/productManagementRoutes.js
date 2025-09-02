const express = require('express');
const router = express.Router(); 
const createSecuredRoutes = require('../utils/createSecuredRoutes');
const authMiddleware  = require('../middleware/auth');
const upload = require('../middleware/uploads');

// Controllers
const productCategoryController = require('../controllers/Admin/Product Management/productCategoryController');
const productController = require('../controllers/Admin/Product Management/productController');
const productPriceController = require('../controllers/Admin/Product Management/productPriceController');

// Validators 
const {
  addProductCategoryValidation,
  updateProductCategoryValidation,
  deleteCategoryValidation,
  changeCategoryStatusValidation,

  addProductValidation,
  updateProductValidation,
  deleteProductValidation,
  changeProductStatusValidation,

  createProductPriceValidator,
  updateProductPriceValidator,
  deleteProductPriceValidator,
} = require('../validators/productManagement');


const securedRoutes = createSecuredRoutes(authMiddleware, (router) => {
  // Product Category Routes
  router.post('/category/add', addProductCategoryValidation, productCategoryController.addProductCategory);
  router.post('/category/get-list', productCategoryController.getProductCategoryList);
  router.get('/category/byid/:id', productCategoryController.getProductCategoryById);
  router.put('/category/update/:id', updateProductCategoryValidation, productCategoryController.updateProductCategory);
  router.delete('/category/delete/:id', deleteCategoryValidation, productCategoryController.deleteProductCategory);
  router.patch('/category/change-status/:id', changeCategoryStatusValidation, productCategoryController.changeProductCategoryStatus);

  // Product Routes
  router.post('/products/add', upload.single('icon'), addProductValidation, productController.addProduct);
  router.post('/products/get-list', productController.getProductList);
  router.get('/products/byid/:id', productController.getProductById);
  router.put('/products/update/:id', upload.single('icon'), updateProductValidation, productController.updateProduct);
  router.delete('/products/delete/:id', deleteProductValidation, productController.deleteProduct);
  router.patch('/products/change-status/:id', changeProductStatusValidation, productController.changeProductStatus);

  // Product Price Routes
  router.post('/prices/add', createProductPriceValidator, productPriceController.addProductPrice);
  router.post('/prices/get-list', productPriceController.getProductPricingList);
  router.get('/prices/byid/:id', productPriceController.getProductPriceById);
  router.put('/prices/update/:id', updateProductPriceValidator, productPriceController.updateProductPrice);
  router.delete('/prices/delete/:id', deleteProductPriceValidator, productPriceController.deleteProductPrice);
});
  // Product Category Routes
  router.post('/category/add', addProductCategoryValidation, productCategoryController.addProductCategory);
  router.post('/category/get-list', productCategoryController.getProductCategoryList);
  router.get('/category/byid/:id', productCategoryController.getProductCategoryById);
  router.put('/category/update/:id', updateProductCategoryValidation, productCategoryController.updateProductCategory);
  router.delete('/category/delete/:id', deleteCategoryValidation, productCategoryController.deleteProductCategory);
  router.patch('/category/change-status/:id', changeCategoryStatusValidation, productCategoryController.changeProductCategoryStatus);

  // Product Routes
  router.post('/products/add', upload.single('icon'), addProductValidation, productController.addProduct);
  router.post('/products/get-list', productController.getProductList);
  router.get('/products/byid/:id', productController.getProductById);
  router.put('/products/update/:id', upload.single('icon'), updateProductValidation, productController.updateProduct);
  router.delete('/products/delete/:id', deleteProductValidation, productController.deleteProduct);
  router.patch('/products/change-status/:id', changeProductStatusValidation, productController.changeProductStatus);

  // Product Price Routes
  router.post('/prices/add', createProductPriceValidator, productPriceController.addProductPrice);
  router.post('/prices/get-list', productPriceController.getProductPricingList);
  router.get('/prices/byid/:id', productPriceController.getProductPriceById);
  router.put('/prices/update/:id', updateProductPriceValidator, productPriceController.updateProductPrice);
  router.delete('/prices/delete/:id', deleteProductPriceValidator, productPriceController.deleteProductPrice);
// router.use('/', securedRoutes);

module.exports = router;
