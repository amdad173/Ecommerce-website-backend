import express from 'express'
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import { brainTreePaymentController, braintreeTokenController, createProductController, deleteProductController, getProductController, getSingleProductController, productCategoryController, productCountController, productFiltersController, productListContorller, productPhotoController, realtedProductController, searchProductController, updateProductController } from '../controllers/productController.js';
import formidable from "express-formidable"     //help to easily upload any type of file


const router = express.Router();

//routes
// create
router.post('/create-product', requireSignIn, isAdmin, formidable(), createProductController )

// update product
router.put('/update-product/:pid', requireSignIn, isAdmin, formidable(), updateProductController)

// get all product
router.get('/get-product', getProductController )

// get single product
router.get('/get-product/:slug', getSingleProductController)

// get single product photo
router.get('/product-photo/:pid', productPhotoController)

// delete product
router.delete('/delete-product/:pid', deleteProductController)

//filter controller
router.post('/product-filters', productFiltersController)

//product count 
router.get('/product-count', productCountController)

//product per page
router.get('/product-list/:page', productListContorller)

//search product
router.get("/search/:keyword", searchProductController);

//similar product
router.get("/related-product/:pid/:cid", realtedProductController);

//category wise product
router.get("/product-category/:slug", productCategoryController);

//payments routes
//token
router.get("/braintree/token", braintreeTokenController);

//payments
router.post("/braintree/payment", requireSignIn, brainTreePaymentController);

export default router;
