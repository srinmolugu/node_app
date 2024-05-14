const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');
const session = require('express-session');
const Employees = require("./models/EmployeeModel");
const Users = require("./models/UserModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const MongoDBSession = require('connect-mongodb-session')(session)
const secretKey = 'my_secret_key';

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
  cookie: { maxAge: 120000 } // session timeout of 60 seconds
}))
//routes
app.get("/", (req, res) => {
  req.session.isAuth = true;
  res.send("Session is Authenticated and Pages are ready for use");
});

// Register route
app.post('/register', async (req, res) => {
  let user = await Users.findOne({ username: req.body.username })
    if (user) {
        return res.status(400).send('User already exisits. Please sign in')
    } else {
        try {
            const salt = await bcrypt.genSalt(10)
            const password = await bcrypt.hash(req.body.password, salt)
            const user = new Users({
                username: req.body.username,
                password: password,
                role: req.body.role
            })
            await user.save()
            return res.status(201).json(user)
        } catch (err) {
            return res.status(400).json({ message: err.message })
        }
    }
});


//Handling user login
app.post("/login", async function(req, res){
  try {
      // check if the user exists
      const user = await Users.findOne({ username: req.body.username });
      if (user) {
        //check if password matches
        bcrypt.compare(req.body.password, user.password, function(err, result) {
          if (err){
            res.status(500).json({ error: err });
          }
          if (result) {
            const token = jwt.sign({ username: user.username }, secretKey);
            res.setHeader('authorization', token)
            res.status(200).json({ message: "U can browser paths in the website based on your role access" ,token: token})
          } else {
            res.status(400).json({ error: "password doesn't match" });
          }
        })
      } else {
        res.status(400).json({ error: "User doesn't exist" });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
});

// Authorization middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (token == null) {
      return res.status(401).send("Unauthorized");
  }
  jwt.verify(token, secretKey, async (err, user) => {
    let role = await Users.findOne({ username: user.username })
      if (err) {
          return res.status(403).send("Forbidden");
      }
      if(role.role === 'admin'){
        req.user = user;
        next();
      }else{
        return res.status(403).send("U are a basic user, U don't have access to this path");
      }
      
  });
}

//getting whole products - added filtering as well
app.get("/employees", authenticateToken, async (req, res) => {
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
      if(req.session.isAuth){
        res
        .status(200)
        .json(
          employees != ""
            ? { pageNumber: pageNumber, employees: employees }
            : "Page Doesn't Exist"
        );
      }else{
        res
        .status(401)
        .json({ message: 'Invalid Session' })
      }
    
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