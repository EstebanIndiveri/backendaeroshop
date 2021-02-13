import User from '../models/User.js';
import asyncHandler from 'express-async-handler'
import { generateToken } from '../utils/generateToken.js';

// @desc Auth user & get Token
// @route POST /api/users/login
// @access public 
export const authUser=asyncHandler(async(req,res)=>{
    const {email,password}=req.body
    const user=await User.findOne({email})
    if(user && (await user.matchPassword(password))){
        return res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
            token:generateToken(user._id),
        })
    }else{
        return res.status(401).json({message:'Invalid email or password'})
    }
})
// @desc Get user profile
// @route POST /api/users/profile
// @access Private
export const getUserProfile=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.user._id)
    if(user){
        return res.json({
            _id:user._id,
            name:user.name,
            email:user.email,
            isAdmin:user.isAdmin,
        })
    }else{
        return res.status(404).send({message:'User not found'})
    }
})

// @desc Register new user
// @route POST /api/users/
// @access public 
export const registerUser=asyncHandler(async(req,res)=>{
    const {name,email,password}=req.body
    const userExist=await User.findOne({email})
   if(userExist){
       return res.status(400).send({message:'User already exists'})
   }
   const user = await User.create({
       name,
       email,
       password
   })
   if(user){
    return res.status(201).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        isAdmin:user.isAdmin,
        token:generateToken(user._id),
    })
   }else{
    return res.status(400).send({message:'Invalid user data , try again'})
   }
})