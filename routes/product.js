const express = require('express');
const router = express.Router();
const {productModel , validateProduct} = require('../models/product');
const { categoryModel, validateCategory} = require('../models/category');
const{ validateCart, cartModel} = require('../models/cart');
const upload = require('../config/multer_config')
const index = require('./index');
const {validateAdmin , userIsLoggedIn} = require('../middlewares/admin')



router.get("/",userIsLoggedIn, async function (req, res){
  let somethingInCart = false;
   
   //aggregate query for products
   const result = await productModel.aggregate([
    {
      $group: {//creating a new data structure on the basis of categpries 
        _id: "$category", // Group by the category field
        products: { $push: "$$ROOT" }, // Push the entire document into an array //$$root means thw whole data of the product
      },
    },
    {
      $project: {//project means changing its name 
        _id: 0, // Remove the _id field
        category: "$_id", // Rename _id to category
        products: { $slice: ["$products", 10] }, // Limit to the first 10 products
        //$slice means cutting the ten products from the entire range of products
      },
    },
  ]);

  let cart = await cartModel.findOne({user: req.session.passport.user})
  if( cart && cart.products.length>0) somethingInCart = true;

  //for fetching random three products from all the available products 

  let rnproducts = await productModel.aggregate([{$sample:{size : 3} }])
  //convert the resultant array to object where key is category and value is array of products

 const resultObject = result.reduce((acc, item) => {
  acc[item.category] = item.products;
  return acc;
 },{})

   res.render("index", { products : resultObject,rnproducts,somethingInCart,cartCount: cart ? cart.products.length: 0});
})

router.get("/delete/:id",validateAdmin, async function (req, res){
    //for deleting we need to find the product first findig on the basis of id 
    //before deleting we need to check that the user is admin or not 
    if(req.user.admin){
    let prods = await  productModel.findOneAndDelete({_id: req.params.id});
    return res.redirect("admin/products");
    }
        res.send("You are not authorized to delete this product")
    

})
router.post("/delete",validateAdmin, async function (req, res){
    //for deleting we need to find the product first findig on the basis of id 
    //before deleting we need to check that the user is admin or not 
    if(req.user.admin){
    let prods = await  productModel.findOneAndDelete({_id:req.body.product_id});
    return res.redirect("back");//on writting back we will be moved back to the last or previoused use page
    }
        res.send("You are not authorized to delete this product")
    

})

//for creating the product
router.post("/",upload.single("image") ,async function (req, res){
try{
    const { name, price, category, stock, description } = req.body;

    if (!req.file) {
        return res.status(400).send({ error: "Image is required." });
    }

    const image = req.file.buffer;

    let { error } = validateProduct({ name, price, category, stock, description, image });
    if (error) {
        return res.status(400).send({ error: error.details });
    }

    let isCategory = await categoryModel.findOne({ name: category})
    if(!isCategory) {
         await categoryModel.create({ name: category}) 
    }
   
     // Create product in the database
      await productModel.create({
        name, price, category, stock, description, image: Buffer.from(image,"base64")
    });
   
    
    res.redirect(`/admin/dashboard` );
   }
   catch(err){
    res.send(err.message);
   }
})


module.exports = router;