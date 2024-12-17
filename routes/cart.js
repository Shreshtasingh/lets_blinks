const express = require('express');
const router = express.Router();
const { cartModel , validateCart} = require('../models/cart');
const {validateAdmin, userIsLoggedIn} = require('../middlewares/admin')
const { productModel, validateProduct } = require('../models/product') 
const mongoose = require('mongoose');
const passport = require('passport');

// Middleware to check DB connection
router.use((req, res, next) => {
    if (!mongoose.connection.readyState) {
      return res.status(500).send('Database not connected');
    }
    next();
  });




//to show everything that my user have in its cart
router.get('/',userIsLoggedIn,async function (req, res) {
    //we need to fetch user id first then we will match whether the id of the ordered product matches to the id of the user 
    try{
        let cart = await cartModel
        .findOne({user : req.session.passport.user})
        .populate("products")

        if (!cart) {
            return res.render("cart", { cart: [], finalprice: 0 });
        }

        //creating this for if we have any repeated element then increase its value by one 
        let cartDataStructure = {};

        cart.products.forEach(product => {
            let key = product._id.toString();
            if(cartDataStructure[key]){
                cartDataStructure[key].quantity += 1;
            }else{
                //if not present then adding it in cart
                cartDataStructure[key] = {
                    ...product._doc,
                    quantity : 1,
                }
            }
            })
            //converting all the object into values of data structure 

            let finalArray = Object.values(cartDataStructure);
           let finalprice = cart.totalPrice + 34;

          
        res.render("cart", { cart: finalArray,finalprice: finalprice, userid : req.session.passport.user})
    }
    catch (err){
        res.send(err.message);
    }
   
    
});
//adding new elements to the cart 
router.get('/add/:id',userIsLoggedIn,async function (req,res){
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('Invalid product ID');
        }

          let cart = await cartModel.findOne({
            user : req.session.passport.user
        })//need to find the product as well for gettig  its price 
        let product = await productModel.findById( req.params.id);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        //chechk whether the cart is already present or not of the user 
        if(!cart){
            //if not present then creating a new cart for the user 
                cart = await cartModel.create({
                    user : req.session.passport.user,
                    products : [req.params.id],
                    totalPrice : Number(product.price),
                })
            }
                //if cart is already present , just adding the new products 
                else{
                    cart.products.push(req.params.id);
                    //updating cart toal price 
                    cart.totalPrice = Number(cart.totalPrice)+ Number(product.price);
                    await cart.save();
                }
     res.redirect("back");
    }
    catch (err){
        res.send(err.message);
    }
})

router.get('/remove/:id',userIsLoggedIn,async function (req,res){
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).send('Invalid product ID');
        }

          let cart = await cartModel.findOne({
            user : req.session.passport.user
        })//need to find the product as well for gettig  its price 
        let product = await productModel.findById( req.params.id);

        if (!product) {
            return res.status(404).send('Product not found');
        }

        //chechk whether the cart is already present or not of the user 
        if(!cart){
           return res.send("theres nothing in the cart")
            }
                //if cart is already present , just adding the new products 
                else{
                     let prodId = cart.products.indexOf(req.params.id);
                    cart.products.splice(prodId,1);
                    //updating cart toal price 
                    cart.totalPrice = Number(cart.totalPrice) - Number(product.price);
                    await cart.save();
                }
     res.redirect("back");
    }
    catch (err){
        res.send(err.message);
    }
})

//to remove products from cart
router.get("/remove/:id" , userIsLoggedIn, async function(req, res){
   try{

     // Validate product ID
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).send('Invalid product ID');
    }

     //finding the cart 
     let cart = await cartModel.findOne({user : req.session.passport.user})
     if(!cart) return res.send("cart not found")
         //fetching the index 
     let index =  cart.products.indexOf(req.params.id);
     if(index !== -1)   //deleting the product 
     cart.products.splice(index,1)// removing one product from the index 
     else return res.send("item is not present in the cart")
     //saving the cart 
      await cart.save();
      res.redirect("back")
   }
   catch(err){
     res.send(err.message);
   }

})

module.exports = router;