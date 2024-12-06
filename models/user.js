const { name } = require("ejs");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:false
    },
    created:{
        type:Date,
        required:false,
        default:Date.now,
    }
});

module.exports = mongoose.model("User", userSchema);