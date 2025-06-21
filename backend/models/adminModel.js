import mongoose from 'mongoose'

const adminSchema = new mongoose.Schema({
    fullName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    // may this will use later
    //role:{type:String,default:"admin"}
});


const adminModel = mongoose.models.admin || mongoose.model('admin', adminSchema);


export default adminModel;