export const createToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET)
}