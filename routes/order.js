const express = require('express');
const { paymentModel } = require('../models/payment');
const {orderModel } = require('../models/order');
const { cartModel } = require('../models/cart');
const router = express.Router();

router.get('/:userid/:orderid/:paymentid/:signature', async function(req, res) {
    //check order created or not  and check it payment 
    let paymentDetails = await paymentModel.findOne({
        orderId: req.params.orderid
    });
    if(!paymentDetails) return res.send("payment not completed");
    if(req.params.signature === paymentDetails.signature && req.params.paymentid === paymentDetails.paymentid)
        {
            

           let cart =  await cartModel.findOne({user: req.params.userid});

           if (!cart) {
            return res.send("Cart not found");
        }

        if (cart.products && cart.totalPrice) {
            console.log("Creating order with these cart details:", cart.products, cart.totalPrice);

           await  orderModel.create({
             orderId: req.params.orderid,
              user:req.params.userid,
              products: cart.products,
              totalPrice: cart.totalPrice,
              status:"processing",
              payment: paymentDetails._id,
             
            });
        return res.redirect(`/map/${req.params.orderid}`)
    }else {
        return res.send("Cart is empty or missing required fields");
    }
}
    else{
        return res.send("payment failed");
    }
});



router.post('/address/:orderid', async function(req, res) {
 let order = await orderModel.findOne({
    orderId: req.params.orderid
 }
 )
 if(!order) return res.send("order not found");
 if(!req.body.address) return res.send("address not found");
 order.address = req.body.address
 await order.save();
 res.redirect("/");
});



module.exports = router;