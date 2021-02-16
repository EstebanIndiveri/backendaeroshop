import express from 'express';
// import products from './db/products.js';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler, notFound } from './middleware/errroMiddleware.js';
import mercadopago from 'mercadopago';
// import PaymentController from './controllers/PaymentController.js';
// import PaymentService from './services/PaymentService.js';

dotenv.config();
connectDB();
const app=express();
app.use(express.json())
app.use(cors({origin:function(origin,callback){
  callback(null, origin);
},
credentials: true
}));
// mercadoPago API
// const PaymentInstance = new PaymentController(new PaymentService());
// app.post("/payment/new", (req, res) =>PaymentInstance.getMercadoPagoLink(req, res));
// app.post("/webhook", (req, res) => PaymentInstance.webhook(req, res));
mercadopago.configurations.setAccessToken(process.env.ACCESS_TOKEN_API); 
app.use(express.urlencoded({ extended: false }));
app.post("/create_preference", (req, res) => {

	let preference = {
		items: [{
			title: req.body.description,
			unit_price: Number(req.body.price),
			quantity: Number(req.body.quantity),
		}],
		back_urls: {
			"success": "http://localhost:5000/feedback",
			"failure": "http://localhost:5000/feedback",
			"pending": "http://localhost:5000/feedback"
		},
		auto_return: 'approved',
	};
  console.log(preference)
	mercadopago.preferences.create(preference)
		.then(function (response) {
			res.json({id :response.body.id})
		}).catch(function (error) {
			console.log(error);
		});
});

app.get('/feedback', function(request, response) {
	 response.json({
		Payment: request.query.payment_id,
		Status: request.query.status,
		MerchantOrder: request.query.merchant_order_id
	})
});



// finish mp

// others routes
app.use('/api/products',productRoutes);
app.use('/api/users',userRoutes);
app.use('/api/orders',orderRoutes);
app.get('/api/config/paypal',(req,res,next)=>res.send(process.env.PAYPAL_CLIENT_ID))
app.use(notFound)

app.use(errorHandler);


const PORT=process.env.PORT || 5000;

app.listen(PORT,console.log(`Server up in ${process.env.PORT}, enviroment: ${process.env.NODE_ENV}`));