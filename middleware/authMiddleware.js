import jwt from 'jsonwebToken'
import User from '../models/User.js';

export const protect=async(req,res,next)=>{
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token=req.headers.authorization.split(' ')[1];
            const decoded=jwt.verify(token,process.env.JWT_SECRET);
            // console.log(decoded);
            req.user=await User.findById(decoded.id).select('-password')
            return next();
        } catch (error) {
            console.log(error);
            return res.status(401).send({message:'No Authorized'})

        }
    }
    if(!token){
        // res.status(401).json({message:'Not Authorized,'})
        return res.status(401).send({message:'No Authorized'})
    }
    next();
} 
export const admin=(req,res,next)=>{
    if(req.user&&req.user.isAdmin){
        return next();
    }else{
        return res.status(401).send({message:'No Authorized as an Admin'})
    }
}