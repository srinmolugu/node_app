const express = require("express");
const mongoose = require("mongoose");
const app = express();

//routes
app.get("/", (req, res) => {
  res.send("Hi sd");
});

app.get("/product", (req, res) => {
  res.send("Hi world");
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
