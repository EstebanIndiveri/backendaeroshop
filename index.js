import express from 'express';
// import products from './db/products.js';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import { errorHandler, notFound } from './middleware/errroMiddleware.js';

dotenv.config();
connectDB();
const app=express();

app.use('/api/products',productRoutes);

app.use(notFound)

app.use(errorHandler)


const PORT=process.env.PORT || 5000

app.listen(PORT,console.log(`Server up in ${process.env.PORT}, enviroment: ${process.env.NODE_ENV}`))