// const axios = require("axios");
import axios from 'axios';

class PaymentService {
  constructor() {
    this.tokensMercadoPago = {
      prod: {},
      test: {
        access_token:
          // "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398"
          "TEST-3719445909764214-021517-d68a4d48d86ac815cef46e807dd71264-173371285"
      }
      
    };
    this.mercadoPagoUrl = "https://api.mercadopago.com/checkout";
  }

  async createPaymentMercadoPago(name, price, unit, img) {
    const url = `${this.mercadoPagoUrl}/preferences?access_token=${this.tokensMercadoPago.test.access_token}`;
    const items = [
      {
        id: 1234,
        title: name,
        description: "Aeroshop order",
        picture_url: img,
        quantity: parseInt(unit),
        unit_price: parseFloat(price)
      }
    ];

    const preferences = {
      items,
      external_reference: "esteban.indiveri@gmail.com",
      payer: {
        name: "Lalo",
        surname: "Landa",
        // email: "test_user_63274575@testuser.com",
        email: "example@testuser.com",
        phone: {
          area_code: "11",
          number: "22223333"
        },
        address: {
          zip_code: "1111",
          street_name: "False",
          street_number: "123"
        }
      },
      payment_methods: {
        excluded_payment_methods: [
          {
            id: "amex"
          }
        ],
        excluded_payment_types: [{ id: "atm" }],
        installments: 6,
        // default_installments: 6
      },
      back_urls: {
        success: "http://localhost:3000/",
        pending: "http://localhost:3000/",
        failure: "http://localhost:3000/"
      },
      notification_url: "https://hookb.in/VGdz7EGKm0hE22bwzjO6",
      auto_return: "approved"
    };

    try {
      const request = await axios.post(url, preferences, {
        headers: {
          "Content-Type": "application/json",
          "x-integrator-id": "dev_6208a189e7f311eab4a00242ac130004"
        }
      });
      return request.data;
    } catch (e) {
      console.log(e);
    }
  }
}

export default PaymentService;