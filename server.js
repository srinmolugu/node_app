const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/productModel");
const app = express();

app.use(express.json());
//routes
app.get("/", (req, res) => {
  res.send("Hi sd");
});

//getting whole products - added filtering as well
app.get("/products", async (req, res) => {
  const filters = req.query || "";
  let filteredResults = [];
  try {
    const products = await Product.find({});
    let isQueryValid = true;
    const sortTag = req.query.sort;
    const filtered = products
      .sort((a, b) => {
        return sortTag === "price"
          ? a.price - b.price
          : sortTag === "quantity"
          ? a.quantity - b.quantity
          : products;
      })
      .filter((ele) => {
        if (sortTag) {
          return products;
        } else {
          for (key in filters) {
            isQueryValid = ele[key] && ele[key] == filters[key];
          }
          return isQueryValid;
        }
      });
    res.status(200).json(filtered);
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
    "mongodb+srv://srinmolugu:rVWg3OgQOm6w0qt4@cluster0.jkz7oct.mongodb.net/"
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
