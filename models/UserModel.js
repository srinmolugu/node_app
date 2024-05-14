const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true

    },
    role: {
        type: String,
        required: true

    }
},
{
    timestamps: false
}
);

const Users = mongoose.model('Users', UserSchema);
module.exports = Users
