import jwt from 'jsonwebtoken'

// Middleware to authenticate routes
const authRoute = async (req,res,next)=>{

    // token is passed in header

    const {token} = req.headers;

    // role is passed in body
    // this is used to check which model to use for authentication

    const {role} = req.body;

    if(!token){
        return res.json({success:false,message:"Not Authorized Login Again"})
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        //exists in the database based on the role

        req.body.userId = decoded.id;
        req.body.role = role;
        next();
    } catch (error) {
        console.log(error);
        return res.json({success:false,message:"Error"})
    }
}

export default authRoute;