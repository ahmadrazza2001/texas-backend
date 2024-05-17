const express = require("express");
const productRoutes = require("../../controllers/productControllers/productController");
const productRouter = express.Router();
const verifyAuth = require("../../middlewares/verifyAuth");
const isVendor = require("../../middlewares/isVendor");

productRouter
  .route("/createProduct")
  .post(verifyAuth, productRoutes.createProduct);

productRouter
  .route("/updateProduct/:id")
  .patch(verifyAuth, isVendor, productRoutes.updateProduct);

productRouter
  .route("/deleteProduct/:id")
  .patch(verifyAuth, isVendor, productRoutes.deleteProduct);

productRouter
  .route("/searchProduct")
  .get(verifyAuth, productRoutes.searchProduct);

productRouter.route("/myProducts").get(verifyAuth, productRoutes.myProducts);

productRouter.route("/allProducts").get(productRoutes.allProducts);

productRouter.route("/productDetails/:id").get(productRoutes.getProductDetails);

module.exports = productRouter;
