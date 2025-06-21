import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema(
    {
        fullName:{type: String, required: true},
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        phone: {type: String, required: true},
        address: {type: String, required: true},
        profilePic:{type: String, default: ""},
        language : {type: String, default: "en"},
        crop : {type: String, default: ""},
        tools : {type:Object, default: {}},

        // optional case for verification
        //isVerified: {type: Boolean, default: false},
    },
    // prevents Mongoose from removing empty objects from documents when they are saved to MongoDB.
    {minimize: false},
)

const farmerModel = mongoose.models.farmer || mongoose.model("farmer", farmerSchema);

export default farmerModel;