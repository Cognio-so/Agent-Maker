const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        select: false
    },
    role:{
        type:String,
        enum:['admin','employee'],
        default:'employee',
    },  
    profilePic: {
        type: String,
        default: null
    }
}, {timestamps:true});
    
const User = mongoose.model('User', userSchema);

module.exports = User;
