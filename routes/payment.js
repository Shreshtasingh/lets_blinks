require('dotenv').config();
const { paymentModel } = require('../models/payment');
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const express = require('express');
const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Endpoint to create a Razorpay order
router.post('/create/orderId', async (req, res) => {
    try {
      const { amount } = req.body; // Accept dynamic amounts from the client
  
      console.log('Received Amount:', amount);  // Debugging: Log the amount received
  
      if (!amount || isNaN(amount) || amount <= 0 || amount > 100000) {  // Check if the amount exceeds 100,000 INR
        return res.status(400).json({ error: 'Invalid amount or exceeds limit of ₹100,000' });
      }
  
      // Razorpay order creation options
      const options = {
        amount: amount * 100, // Convert to paise (smallest unit of INR)
        currency: 'INR',
      };
  
      const order = await razorpay.orders.create(options);
  
      // Generate a unique transactionId using uuidv4
      const transactionId = uuidv4();  // This will always generate a unique ID
  
      // Prepare the payment data to store in the database
      const paymentData = {
        orderId: order.id,
        amount: amount,
        currency: order.currency,
        status: 'pending',
        order: order.id, // Razorpay order ID
        paymentId: null, // Set as null initially
        signature: null, // Set as null initially
        transactionId: transactionId, // Use the generated unique transactionId
      };
  
      // Save payment details in the database
      await paymentModel.create(paymentData);
  
      // Respond with the created order details
      res.status(201).json(order);
    } catch (err) {
      console.error('Order creation error:', err);
      res.status(500).json({
        error: 'Error creating Razorpay order',
        details: err.message,
      });
    }
  });
// Endpoint to verify Razorpay payment
router.post('/api/payment/verify', async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !signature) {
    return res.status(400).json({ error: 'Missing required payment details' });
  }

  try {
    // Validate the Razorpay signature
    const isValidSignature = razorpay.utils.verifyPaymentSignature({
      order_id: razorpayOrderId,
      payment_id: razorpayPaymentId,
      signature: signature,
    });

    if (!isValidSignature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Find and update the payment record
    const payment = await paymentModel.findOne({
      orderId: razorpayOrderId,
      status: 'pending',
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    payment.paymentId = razorpayPaymentId;
    payment.signature = signature;
    payment.status = 'success';
    await payment.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      razorpayOrderId,
      razorpayPaymentId,
      signature,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Error verifying payment',
      details: error.message,
    });
  }
});

module.exports = router;
