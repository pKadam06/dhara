const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String
    },

    state: {
        type: String
    },

    district: {
        type: String
    },

    village: {
        type: String
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);