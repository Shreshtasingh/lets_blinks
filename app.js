const express = require('express');
const indexRouter = require('./routes/index');
const app = express();
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const productsRouter = require('./routes/product');
const categoriesRouter = require('./routes/category');
const cartRouter = require('./routes/cart');
const paymentRouter = require('./routes/payment');
const orderRouter = require('./routes/order');
const passport = require('passport');

const userRouter = require('./routes/user');
const path = require('path');
const expressSession = require("express-session");
const cookieParser = require('cookie-parser');


//setting up env , activates the dot env file
require("dotenv").config();

//requring the mongoose file for the mongoose connection
require("./config/db")
require("./config/google_oauth_config")

//setting up express session
app.set("view engine", "ejs");

app.set('views', path.join(__dirname, 'views')); 

app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(expressSession({//provided in documentation already
    resave : false,
    saveUninitialized : false,
    secret : process.env.SESSION_SECRET
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());


app.use("/",indexRouter);
app.use("/auth",authRouter);
app.use("/admin",adminRouter);
app.use("/products",productsRouter);
app.use("/categories",categoriesRouter);
app.use("/users",userRouter);
app.use("/cart",cartRouter);
app.use("/payment",paymentRouter);
app.use("/order",orderRouter);

app.listen(3000)