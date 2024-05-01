const mongoose = require("mongoose");

const EmployeeSchema = mongoose.Schema(
  {
    name: {
        type: String,
        required: true
    },
    employeeId: {
        type: Number,
        required: true,
        default: 0
    },
    salary: {
        type: Number,
        required: true,
    }
},
{
    timestamps: false
}
);

const Employees = mongoose.model('Employees', EmployeeSchema);
module.exports = Employees
