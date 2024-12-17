const express = require('express');
const router = express();
const { adminModel} = require("../models/admin");
const {productModel} = require("../models/product");
const bcryptjs = require("bcryptjs");
const bycrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {validateAdmin} = require("../middlewares/admin");
const { categoryModel } = require('../models/category');
require("dotenv").config();//becz we gonna use env here
if(//by this we can create routes and decide whether we want to keep them in development mode or in production mode 
    typeof process.env.NODE_ENV !== undefined &&process.env.NODE_ENV === 'DEVELOPMENT'
) {
    //this route would be available only when we are in development mode 
    router.get('/create', async function (req, res) {
        try {
            // Check if admin already exists
            let existingAdmin = await adminModel.findOne({ email: "shreshta@blink.com" , admin : true });
            if (existingAdmin) {
                return res.send("Admin already exists!");
            }
    
            // Encrypt password
            let salt = await bcryptjs.genSalt(10);
            let hash = await bycrypt.hash("admin", salt);
    
            // Create new admin
            let user = new adminModel({
                name: "shreshta",
                email: "shreshta@blink.com",
                password: hash,
                role: "admin"
            });
            await user.save();
    
            let token = jwt.sign({ email: "shreshta@blink.com" }, process.env.JWT_KEY);
            res.cookie("token", token);
            res.send("Admin Created");
        } catch (err) {
            console.error("Error in creating admin:", err);
            res.status(500).send("Internal server error");
        }
    });
    
    
   }

   //to login the admin
   router.get("/login",function(req, res) {
    return res.render("admin_login");
   })

   router.post("/login",async function(req, res) {
   try{ //fetching email and password form req.body
    let {email, password} = req.body;
    //find whether this admin exists or not 
    let admin =  await adminModel.findOne({email})
    //if admin with that email not found
    if(!admin) {
      return  res.status(404).send("Admin not found");
    }
     let valid = await bycrypt.compare(password, admin.password);

     if (!valid) {
        return res.status(401).send("Invalid password");
    }
     
      //if valid then create a token 
        let token =  jwt.sign({email:"shreshta@blink.com", admin: true}, process.env.JWT_KEY)
        res.cookie("token", token);
       return res.redirect("/admin/dashboard");

    }catch (err){
        console.error("Error in admin login:", err);
       return res.status(500).send("Internal server error");
    }
});

    router.get("/dashboard",validateAdmin,async function(req, res) {
        //before logining into the admin dashboard we first need to check whether the user is validated or not
        //we need to show all the products in admin dsbpard 
         let prodcount = await productModel.countDocuments();
         let categcount = await categoryModel.countDocuments();
         
       return res.render("admin_dashboard",{prodcount, categcount});
       })

       router.get("/products", validateAdmin, async function (req, res) {
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
    //convert the resultant array to object where key is category and value is array of products

   const resultObject = result.reduce((acc, item) => {
    acc[item.category] = item.products;
    return acc;
   },{})

  res.render("admin_products", {products : resultObject})
});


    router.get("/logout",validateAdmin,function(req, res) {
        res.cookie("token","");
       return res.redirect("/admin/login");
    })

   
  
module.exports = router;