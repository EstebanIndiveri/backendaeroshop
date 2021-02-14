import Order from '../models/Order.js';
import asyncHandler from 'express-async-handler'


// @desc Create new order
// @route POST /api/orders
// @access private 
    // return res.status(404).send({message:'No authorized'})

export const addOrderItems=asyncHandler(async(req,res)=>{
    const {orderItems,shippingAddress,paymentMethod,itemsPrice,taxPrice,shippingPrice,totalPrice} = req.body;
    if(orderItems && orderItems.length===0){
       return res.status(400).send({message:'No order items'});
    }else{
        const order= new Order({
            orderItems,
            user:req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice
        })
        const createdOrder=await order.save();
        return res.status(201).json(createdOrder)
    }
})
// @desc Get order by ID
// @route Get /api/orders/:ID
// @access private 
export const getOrderById=asyncHandler(async(req,res)=>{
   const order=await Order.findById(req.params.id).populate('user','name email')
   if(order){
       return res.json(order);
   }else{
       return res.status(404).send({message:'Order not found'})
   }
})