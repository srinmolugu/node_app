const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/productModel");
const app = express();
const cors = require('cors');
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)

app.use(express.json());
app.use(cors());

const MONGOURI = "mongodb+srv://srinmolugu:rVWg3OgQOm6w0qt4@cluster0.jkz7oct.mongodb.net/"
const store = new MongoDBSession({
  uri: MONGOURI,
  collection: 'sessions'
})
app.use(session({
  secret: 'this key is a secret key',
  resave: false,
  saveUninitialized: false,
  store: store,
}))
//routes
app.get("/", (req, res) => {
  req.session.isAuth = true;
  console.log('req',req.session);
  console.log('req',req.session.id);
  res.send("Hi sd");
});

//middlewares
const basicMiddleWare = (req, res, next) => {
    // req.query.count = 5
    next();
}

//getting whole products - added filtering as well
app.get("/products", basicMiddleWare, async (req, res) => {
  const filters = req.query || "";
  const count = req.query.count || 0;
  const pageNumber = req.query.page || 1;
  const sortIsImplied = req.query.sort || false;
  const filteredValue = filters.price;
  try {
    const products = await Product.find(
      filteredValue
        ? {
            price: { $gte: filteredValue[0], $lte: filteredValue[1] },
          }
        : {}
    )
      .sort(sortIsImplied ? { price: 1 } : {})
      .skip(count * (pageNumber - 1))
      .limit(count);
    res
      .status(200)
      .json(
        products != ""
          ? { pageNumber: pageNumber, products: products }
          : "Page Doesn't Exist"
      );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//getting product by id
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update a product
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body);
    // we cannot find any product in database
    if (!product) {
      return res
        .status(404)
        .json({ message: `cannot find any product with ID ${id}` });
    }
    const updatedProduct = await Product.findById(id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete a product
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res
        .status(404)
        .json({ message: `cannot find any product with ID ${id}` });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/products", async (req, res) => {
  const {authorized} = req.body || false
  try {
    const product = await Product.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

mongoose
  .connect(
    MONGOURI
  )
  .then(() => {
    console.log("connected to mongodb");
    app.listen(3000, () => {
      console.log("node app running good");
    });
  })
  .catch((error) => {
    console.log("error", error);
  });

//materials:
  //https://www.youtube.com/watch?v=GhrvZ5nUWNg
  //https://www.youtube.com/watch?v=2PPSXonhIck