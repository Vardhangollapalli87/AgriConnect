
import bcrypt from 'bcrypt';
import cloudinary from '../config/cloudinary.js';
import validator from 'validator';
import farmerModel from '../models/farmerModel.js';
import labourModel from '../models/labourModel.js';
import adminModel from '../models/adminModel.js';

import { createToken } from '../utils/token.js';

export const signup = async (req,res) => {

    // extrating role from req.headers
    const {role} = req.headers;



    if(role === 'farmer'){
        return farmerSignup(req,res);
    }else if(role === 'labour'){
        return labourSignup(req,res);
    }else if(role === 'admin'){
        return adminSignup(req,res);
    }else{
        return res.json({success:false,message: 'Invalid role'});
    }
};

    const {fullName,email,password,phone,address} = req.body;

    try{

        //checking if all fields are present
        if(!fullName || !email || !password || !phone || !address){
            return res.json({success:false,message: 'Please fill all fields'});
        }

        //checking is user already exists
        const exists = await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message: 'User already exists'});
        }

        //validating email format & strong password

        if(!validator.isEmail(email)){
            return res.json({success:false,message: 'Invalid email format'});
        }

        if(password.length < 8){
            return res.json({success:false,message: 'Please enter strong Password'});
        }

        //optional for now
        // if(!validator.isStrongPassword(password)){
        //     return res.json({success:false,message: 'Please enter strong Password'});
        // }

        //checking if phone number is valid
        if(!validator.isMobilePhone(phone)){
            return res.json({success:false,message: 'Invalid phone number'});
        }

        //checking if address is valid
        if(!validator.isLength(address,{min:10})){
            return res.json({success:false,message: 'Address should be at least 10 characters long'});
        }

        //hashing user password

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);


        //creating new farmer
        const newFarmer = new farmerModel({
            fullName,
            email,
            password: hashedPassword,
            phone,
            address,
        })

        // saving farmer to database
        const farmer = await newFarmer.save();

        const token = createToken(farmer._id);

        res.json({success:true,token})

    }catch(e){
        console.log(e);
        res.json({success:false,message:'Error'})
    }
};



export const login =async (req,res)=>{

    const {email,password} = req.body;

    try {
        
        const farmer = await farmerModel.findOne({email});


        if(!farmer){
            return res.json({success:false,message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password,farmer.password);

        if(!isPasswordCorrect){
            return res.json({success:false,message: "Invalid credentials"});

        }

        const token = createToken(farmer._id);
        res.json({success:true,token});

    } catch (e) {
        console.log("Error in login",e.message);
        res.json({success:false,message:"Internal Server Error"});
    }
};

export const logout = (req,res)=>{
    try {
        
        res.json({success:true,message:"Logged out successfully"});
    } catch (error) {
        console.log("Error in logout:", error);
        res.json({success:false,message:"Internal Server Error"});
    }
};


export const updateProfile = async(req,res)=>{
    try {
        
        const {profilePic} = req.body;  // base64 string of the profile picture
        const farmerId = req.user._id;  // extracting farmer ID from the request object - auth.js middleware


        if(!profilePic){
            return res.json({success:false,message:"Profile pic is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // Upload the profile picture to Cloudinary
        const updatedFarmer = await farmerModel.findByIdAndUpdate(farmerId,{profilePic:uploadResponse.secure_url},{new:true});
        return res.json({success:true,message:"Profile updated successfully"});


    } catch (error) {
        console.log("error in update profile:",error);
        res.json({success:false,message:"Internal Server Error"});
    }
};