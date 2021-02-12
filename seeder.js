import moongose from 'mongoose';
import dotenv from 'dotenv';
import users from './db/users.js';
import products from './db/products.js'
import User from './models/User.js';
import Order from './models/Order.js';
import connectDB from './config/db.js';
import Product from './models/Product.js';

dotenv.config();

connectDB()

const importData=async()=>{
    try {
        await Order.deleteMany()
        await Product.deleteMany();
        await User.deleteMany();
        const createdUser=await User.insertMany(users)
        const adminUser=createdUser[0]._id
        const sampleProducts=products.map(product=>{
            return{
                ...product,user:adminUser
            }
        })
        await Product.insertMany(sampleProducts)
        console.log('daata imported')
        process.exit();
    } catch (error) {
        console.log('error:'+error);
        process.exit(1)
        
    }
}
const destroyData=async()=>{
    try {
        await Order.deleteMany()
        await Product.deleteMany();
        await User.deleteMany();
        
        console.log('daata destrotyed')
        process.exit();
    } catch (error) {
        console.log('error:'+error);
        process.exit(1)
        
    }
}
if(process.argv[2]==='-d'){
    destroyData();
}else{
    importData();
}