import User from '../models/User.js';
import asyncHandler from 'express-async-handler'


// @desc Auth user & get Token
// @route POST /api/users/login
// @access public 
export const authUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(user && (await user.matchPassword(password))){
        res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
            token:null,
        })
    }else{
        return res.status(401).json({message:'Invalid email or password'})
    }
})

