import mongoose from "mongoose";

const labourSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        profilePic: { type: String, default: "" },
        work : { type: String, default: "" },
    }
);


const labourModel = mongoose.models.labour || mongoose.model("labour", labourSchema);

export default labourModel;