import jwt from 'jsonwebtoken'

// Middleware to authenticate routes
const authRoute = async (req,res,next)=>{

    // token is passed in header

    const {token} = req.headers;

    if(!token){
        return res.json({success:false,message:"Not Authorized Login Again"})
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        // Attach user info to req for controller use
        req.user = { _id: decoded.id };
        next();
    } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Error"})
    }
}

export default authRoute;