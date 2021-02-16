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

// Modelo de ordenes
import Order from './models/Order.js';

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
    payment_methods: {
      excluded_payment_methods: [
        {
          id: "amex"
        }
      ],
      excluded_payment_types: [{ id: "atm" }],
      installments: 6,
    },
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
  			// res.json({id :response.body.id})
         res.json(updatedOrder);
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

// others routes
app.use('/api/products',productRoutes);
app.use('/api/users',userRoutes);
app.use('/api/orders',orderRoutes);
app.get('/api/config/paypal',(req,res,next)=>res.send(process.env.PAYPAL_CLIENT_ID))
app.use(notFound)

app.use(errorHandler);


const PORT=process.env.PORT || 5000;

app.listen(PORT,console.log(`Server up in ${process.env.PORT}, enviroment: ${process.env.NODE_ENV}`));