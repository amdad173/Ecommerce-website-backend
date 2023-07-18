import productModel from "../models/productModel.js"
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";

import fs from 'fs';    //file module needed for using formidable to upload
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});


export const createProductController = async (req, res)=>{
    try{
        const {name, slug, description, price, category, quantity, shipping} = req.fields;  //no need for body, we are using formidable
        const {photo} = req.files;

        if(!name) res.status(500).send({error: "Name is required"})
        if(!description) res.status(500).send({error: "description is required"})
        if(!price) res.status(500).send({error: "price is required"})
        if(!category) res.status(500).send({error: "category is required"})
        if(!quantity) res.status(500).send({error: "quantity is required"})
        if(!photo && photo.size > 1000000) res.status(500).send({error: "Photo is required and should be less then 1MB"})

        const products = new productModel({...req.fields, slug: slugigy(name)})
        if(photo){
            products.photo.data = fs.readFileSync(photo.path);  //read the file synchronously, fs.readFile()- read asynchronously
            products.photo.contentType = photo.type;            //see the model
        }
        await products.save();
        
        res.status(201).send({
            success: true,
            message: "Product Created Successfully",
            products,
        });

    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in Creating Product"
        })
    }
}

// get all product
export const getProductController= async (req, res)=>{
    try{
        const products = await productModel.find({}).select("-photo").populate('category').limit(12).sort({createdAt: -1})  
        // populate shows the whole category which id we pass
        // ("-photo") here "-" meand exluding photo from the result
        // (-1) to sort in decending order,  new created field apear first
        res.status(200).send({
            success: true,
            message: "All Products",
            totalCount: products.length,
            products,
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Error in getting Product"
        })
    }
}

// get single product
export const getSingleProductController= async (req, res)=>{
    try{
        const product = await productModel.findOne({slug: req.params.slug}).select("-photo").populate("category")
       
        res.status(200).send({
            success: true,
            message: "Single Products Fetch",
            product,
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Error in getting single Product"
        })
    }
}

// get product photo
export const productPhotoController= async (req, res)=>{
    try{
        const product = await productModel.findById(req.params.pid).select("photo") //only select photo
        if(product.photo.data){
            res.set('Content-type', product.photo.contentType)    //set the content type as model content type
            return res.status(200).send(product.photo.data);
        }
    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Error while getting Photo"
        })
    }
}
// update product 
export const updateProductController = async (req, res)=>{
    try{
        const {name, slug, description, price, category, quantity, shipping} = req.fields;  //no need for body, we are using formidable
        const {photo} = req.files;

        if(!name) res.status(500).send({error: "Name is required"})
        if(!description) res.status(500).send({error: "description is required"})
        if(!price) res.status(500).send({error: "price is required"})
        if(!category) res.status(500).send({error: "category is required"})
        if(!quantity) res.status(500).send({error: "quantity is required"})
        if(!photo && photo.size > 1000000) res.status(500).send({error: "Photo is required and should be less then 1MB"})

        const products = await productModel.findByIdAndUpdate(
            req.params.pid,
            {...req.fields, slug: slugify(name)}, 
            {new: true})
            
        if(photo){
            products.photo.data = fs.readFileSync(photo.path);  //read the file synchronously, fs.readFile()- read asynchronously
            products.photo.contentType = photo.type;            //see the model
        }
        await products.save();
        
        res.status(201).send({
            success: true,
            message: "Product Updated Successfully",
            products,
        });

    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in Updating Product"
        })
    }
}
// delete product 
export const deleteProductController= async (req, res)=>{
    try{
        await productModel.findByIdAndDelete(req.params.pid).select("-photo") 
        res.status(200).send({
            success: true,
            message: "Product Deleted Successfully"
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error while Deleting Photo",
            error: error.message,
        })
    }
}

// filter product
export const productFiltersController = async(req, res)=>{
    try {
        const { checked, radio } = req.body;
        let args = {};
        if (checked.length > 0) args.category = checked;
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
        const products = await productModel.find(args);
        res.status(200).send({
          success: true,
          products,
        });
      } catch (error) {
        console.log(error);
        res.status(400).send({
          success: false,
          message: "Error WHile Filtering Products",
          error,
        });
      }
}

// product count
export const productCountController = async (req, res)=>{
    try {
       const total = await productModel.find({}).estimatedDocumentCount() //this functon for counting total product
       res.status(200).send({
        success: true,
        total,
       })
      } catch (error) {
        console.log(error);
        res.status(400).send({
          success: false,
          message: "Error in Product count",
          error,
        });
      }
}

// product list based on page
export const productListContorller = async (req, res)=>{
    try {
        const perPage = 3;
        const page = req.params.page ? req.params.page : 1;
        const products = await productModel
          .find({})
          .select("-photo")             //deselect photo
          .skip((page - 1) * perPage)   // skip(6) mean first 6 document of the collection will be skip 
          .limit(perPage)               // maximum number of query will return
          .sort({ createdAt: -1 });     // most resent document will be shown first
        res.status(200).send({
          success: true,
          products,
        });
      } catch (error) {
        console.log(error);
        res.status(400).send({
          success: false,
          message: "Error in per page ctrl",
          error,
        });
      }
}

// search product
export const searchProductController = async (req, res) => {
    try {
      const { keyword } = req.params;
      //The $or operator will match either of the condition with the documents
      //(find keyword that match either name or discrciption match)
      const resutls = await productModel
        .find({
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        })
        .select("-photo");
      res.json(resutls);
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "Error In Search Product API",
        error,
      });
    }
  };

// similar products
export const realtedProductController = async (req, res) => {
    try {
      const { pid, cid } = req.params;
      const products = await productModel
        .find({
          category: cid,
          _id: { $ne: pid }, //not included (in similer product dont include the product we search for)
        })
        .select("-photo")
        .limit(3)
        .populate("category");
      res.status(200).send({
        success: true,
        products,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send({
        success: false,
        message: "error while geting related product",
        error,
      });
    }
  };
  

// get prdocyst by catgory
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModel.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};

//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};