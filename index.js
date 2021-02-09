import express from 'express';
import products from './db/products.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();
connectDB();
const app=express();

app.get('/api/products',(req,res)=>{
    res.json(products);
})

app.get('/api/products/:id',(req,res)=>{
    const product=products.find(p=>p._id===req.params.id)
    res.json(product);
})

const PORT=process.env.PORT || 5000

app.listen(PORT,console.log(`Server up in ${process.env.PORT}, enviroment: ${process.env.NODE_ENV}`))