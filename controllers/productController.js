import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler'


// @desc Fetch all products
// @route GET /api/products
// @access public 
    // return res.status(404).send({message:'No authorized'})

export const getProducts=asyncHandler(async(req,res)=>{
    const products=await Product.find({})
    res.json(products);
})

// @desc Fetch sigle products
// @route GET /api/products/:id
// @access public 
export const getProductById=asyncHandler(async(req,res)=>{
    const product=await Product.findById(req.params.id);
    if(product){
        res.json(product);
    }else{
        res.status(404)
        throw new Error('Product not found')
    }
})
// @desc Fetch sigle products
// @route DELETE /api/products/:id
// @access private/admin 
export const deleteProduct=asyncHandler(async(req,res)=>{
    const product=await Product.findById(req.params.id);
    if(product){
       
        await product.remove();
        res.json({message:'Product removed'})

    }else{
        res.status(404)
        throw new Error('Product not found')
    }
})

// @desc create  products
// @route POST /api/products/
// @access private/admin 
export const createProduct=asyncHandler(async(req,res)=>{
    const product=new Product({
        name:'Sample name',
        price:0,
        user:req.user._id,
        image:'/images/sample.jpg',
        brand:'Sample brand',
        category:'Sample category',
        countInStock:0,
        numReviews:0,
        description:'Sample description',
    })
    const createdProduct=await product.save();
    return res.status(201).json(createdProduct);
})
// @desc update products
// @route PUT /api/products/:id
// @access private/admin 
export const updateProduct=asyncHandler(async(req,res)=>{
    const {name,price,description,image,brand,category,countInStock}=req.body;
    // const createdProduct=await product.save();
    const product=await Product.findById(req.params.id)
    if(product){
        product.name=name,
        product.price=price
        product.description=description
        product.image=image
        product.brand=brand
        product.category=category
        product.countInStock=countInStock
        const updatedProduct=await product.save();
        return res.json({updatedProduct})
    }else{
        return res.status(404).json({message:'product not found'})
    }

})