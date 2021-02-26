import express from 'express';
import path from 'path';
// import products from './db/products.js';
import * as cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import morgan from 'morgan';
import { errorHandler, notFound } from './middleware/errroMiddleware.js';
import mercadopago from 'mercadopago';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const stripe = require('stripe')('pk_test_51ILXZNGrmcGmCK47uGT7R2bf8O0Rqh7g2v623h9PZg54aoHRlCNGYWgYFnTVDiNsGG9oTwxKSZcPg1YZu5StfT3l00V1vBOcVE');


// Modelo de ordenes
import Order from './models/Order.js';

// import PaymentController from './controllers/PaymentController.js';
// import PaymentService from './services/PaymentService.js';
// const corsval=cors({origin:true})
dotenv.config();
connectDB();
const app=express();
app.use(cors({origin:true}));

if(process.env.NODE_ENV==='development'){
  app.use(morgan('dev'))
}

app.use(express.json())

// mercadoPago API
// const PaymentInstance = new PaymentController(new PaymentService());
// app.post("/payment/new", (req, res) =>PaymentInstance.getMercadoPagoLink(req, res));
// app.post("/webhook", (req, res) => PaymentInstance.webhook(req, res));
mercadopago.configurations.setAccessToken(process.env.ACCESS_TOKEN_API); 
app.use(express.urlencoded({ extended: false }));
app.post("/create_preference/:id", async (req, res) => {
  let orderId=req.params.id;
  let order= await Order.findById(orderId);
	let preference = {
		items: [{
			title: req.body.description,
			unit_price: Number(req.body.price),
			quantity: Number(req.body.quantity),
		}],
		back_urls: {
			"success": `http://localhost:3000/`,
			"failure": "http://localhost:3000/",
			"pending": "http://localhost:3000/"
		},
    // payment_methods: {
    //   excluded_payment_methods: [
    //     {
    //       id: "amex"
    //     }
    //   ],
    //   excluded_payment_types: [{ id: "atm" }],
    //   installments: 6,
    // },
    notification_url:"https://hookb.in/VGdz7EGKm0hE22bwzjO6",
    // notification_url:"http://localhost:5000/webhook",
		auto_return: 'approved',
	};
  // console.log(preference)
	mercadopago.preferences.create(preference)
		.then(async function(response) {
      // console.log(order);
      if(order){
        order.isPaid=true;
        order.paidAt=Date.now();
        order.paymentResult={
            id:Math.random().toFixed(10),//change to req.body.id 
            status:'COMPLETED',//Change to req.body.type
            update_time:Date.now(), //change to req.body.date_created
            email_address:"example@example.com"// change to req.body.payer.email_address?
        }
        
        const updatedOrder=await order.save();
  			res.json({id :response.body.id,updatedOrder:updatedOrder})
        //  res.json(updatedOrder);
    }else{
        return res.status(404).send({message:'Order not found'})
    }
			// res.json({id :response.body.id})
		}).catch(function (error) {
			console.log(error);
		});
});

app.post("/webhook", (req, res) => {
  if (req.method === "POST") {
    console.log(req.body.type);
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log(body, "webhook response");
      res.end("ok");
    });
  }
  return res.status(201);
});

app.get('/feedback', function(request, response) {
	 response.json({
		Payment: request.query.payment_id,
		Status: request.query.status,
		MerchantOrder: request.query.merchant_order_id
	})
});

// finish mp


// Start stripe?
// stripe();

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Stubborn Attachments',
            images: ['https://i.imgur.com/EHyR2nP.png'],
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `http://localhost:3000/`,
    cancel_url: `http://localhost:3000/`,
  });
  res.json({ id: session.id });
});



// finish stripe


// others routes
app.use('/api/products',productRoutes);
app.use('/api/users',userRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/upload',uploadRoutes);
app.get('/api/config/paypal',(req,res,next)=>res.send(process.env.PAYPAL_CLIENT_ID))



const __dirname=path.resolve();
app.use('/uploads',express.static(path.join(__dirname,'/uploads')))

app.use(notFound)

app.use(errorHandler);


const PORT=process.env.PORT || 5000;

app.listen(PORT,console.log(`Server up in ${process.env.PORT}, enviroment: ${process.env.NODE_ENV}`));