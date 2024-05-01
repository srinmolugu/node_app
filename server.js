const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');
const session = require('express-session');
const Employees = require("./models/EmployeeModel");
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
app.get("/employees", basicMiddleWare, async (req, res) => {
  const filters = req.query || "";
  const count = req.query.count || 0;
  const pageNumber = req.query.page || 1;
  const sortIsImplied = req.query.sort || false;
  const filteredValue = filters.salary;
  try {
    const employees = await Employees.find(
      filteredValue
        ? {
            salary: { $gte: filteredValue[0], $lte: filteredValue[1] },
          }
        : {}
    )
      .sort(sortIsImplied ? { salary: 1 } : {})
      .skip(count * (pageNumber - 1))
      .limit(count);
    res
      .status(200)
      .json(
        employees != ""
          ? { pageNumber: pageNumber, employees: employees }
          : "Page Doesn't Exist"
      );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//getting product by id
app.get("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employees.findById(id);
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// update a product
app.put("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employees.findByIdAndUpdate(id, req.body);
    // we cannot find any Employee in database
    if (!employee) {
      return res
        .status(404)
        .json({ message: `cannot find any Employee with ID ${id}` });
    }
    const updatedEmployee = await employee.findById(id);
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete a product
app.delete("/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employees.findByIdAndDelete(id);
    if (!employee) {
      return res
        .status(404)
        .json({ message: `cannot find any product with ID ${id}` });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/employees", async (req, res) => {
  const {authorized} = req.body || false
  try {
    const employee = await Employees.create(req.body);
    res.status(200).json(employee);
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