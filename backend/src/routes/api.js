const express = require('express');
const { createUser, handleLogin, getUsers, getAccount } = require('../controllers/userController');
const { getProducts, createProduct, getCategories } = require('../controllers/productController');
const auth = require('../middleware/auth');
const delay = require('../middleware/delay');

const routerAPI = express.Router();


routerAPI.get("/", (req,res) => {
    return res.status(200).json({message: "Hello from API"});
})

routerAPI.post("/register", createUser);
routerAPI.post("/login", handleLogin);
routerAPI.get("/users", getUsers);
routerAPI.get("/account", delay, getAccount);
routerAPI.get('/products', getProducts);
routerAPI.post('/products', createProduct);
routerAPI.get('/categories', getCategories);

module.exports = routerAPI;