
import bcrypt from 'bcrypt';
import cloudinary from '../config/cloudinary.js';
import validator from 'validator';
import farmerModel from '../models/farmerModel.js';
import labourModel from '../models/labourModel.js';
import adminModel from '../models/adminModel.js';

import { createToken } from '../utils/token.js';

export const signup = async (req, res) => {

    // extracting role from req.headers
    const { role } = req.headers;

    // extracting user details from request body
    const { fullName, email, password, phone, address } = req.body;

    // Map roles to their respective models and required fields
    const roleConfig = {
        farmer: {
            model: farmerModel,
            required: ['fullName', 'email', 'password', 'phone', 'address']
        },
        labour: {
            model: labourModel,
            required: ['fullName', 'email', 'password', 'phone']
        },
        admin: {
            model: adminModel,
            required: ['fullName', 'email', 'password']
        }
    };

    const config = roleConfig[role];
    if (!config) {
        return res.json({ success: false, message: 'Invalid role' });
    }

    // Check required fields
    for (const field of config.required) {
        if (!req.body[field]) {
            return res.json({ success: false, message: `Please fill all fields` });
        }
    }

    // Check if user already exists
    const exists = await config.model.findOne({ email });
    if (exists) {
        return res.json({ success: false, message: `${role.charAt(0).toUpperCase() + role.slice(1)} already exists` });
    }

    // Validate email
    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: 'Invalid email format' });
    }

    // Validate password
    if (password.length < 8) {
        return res.json({ success: false, message: 'Please enter strong Password' });
    }

    // Additional validations
    if (role === 'farmer' || role === 'labour') {
        if (!validator.isMobilePhone(phone)) {
            return res.json({ success: false, message: 'Invalid phone number' });
        }
    }
    if (role === 'farmer') {
        if (!validator.isLength(address, { min: 10 })) {
            return res.json({ success: false, message: 'Address should be at least 10 characters long' });
        }
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Prepare user data
        const userData = { fullName, email, password: hashedPassword };
        if (phone) userData.phone = phone;
        if (address) userData.address = address;

        const newUser = new config.model(userData);
        const user = await newUser.save();

        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (e) {
        console.log(e);
        res.json({ success: false, message: 'Error' });
    }
};



export const login = async (req, res) => {
    // extracting role from req.headers
    const { role } = req.headers;
    // extracting email and password from request body
    const { email, password } = req.body;

    let userModel;
    if (role === 'farmer') {
        userModel = farmerModel;
    } else if (role === 'labour') {
        userModel = labourModel;
    } else if (role === 'admin') {
        userModel = adminModel;
    } else {
        return res.json({ success: false, message: 'Invalid role' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (e) {
        console.log("Error in login", e.message);
        res.json({ success: false, message: "Internal Server Error" });
    }
};



export const logout = (req,res)=>{
    try {
        // Clear the token from the client side- local storage or cookies
        res.json({success:true,message:"Logged out successfully"});
    } catch (error) {
        console.log("Error in logout:", error);
        res.json({success:false,message:"Internal Server Error"});
    }
};


export const updateProfile = async (req, res) => {
    
    try {
        const { profilePic } = req.body; // base64 string of the profile picture
        const userId = req.user._id;     // extracting user ID from the request object (set by auth middleware)
        const { role } = req.headers;

        // Map roles to their respective models
        const roleModelMap = {
            farmer: farmerModel,
            labour: labourModel,
            admin: adminModel
        };

        const userModel = roleModelMap[role];
        if (!userModel) {
            return res.json({ success: false, message: "Invalid role" });
        }

        if (!profilePic) {
            return res.json({ success: false, message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);

        // Update the profile picture for the correct user and role
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        if (!updatedUser) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.log("error in update profile:", error);
        res.json({ success: false, message: "Internal Server Error" });
    }
};