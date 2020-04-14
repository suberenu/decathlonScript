const fetch = require('node-fetch');
const { URLSearchParams } = require('url');
const nodemailer = require('nodemailer');
const moment = require('moment');

const config = require('./configSample.json')
const { products } = config;
const { email } = config;

const PURCHASE_URL = "https://www.decathlon.es/es/ajax/rest/model/atg/commerce/order/purchase/CartModifierActor/addItemToOrder";

const transporter = nodemailer.createTransport({
	    host: email.host,
	    port: 587,
	    secure: false,
	    auth: {
	      user: email.from,
	      pass: email.password
	    }
	  });


async function init() {
	for (let i = 0; i < products.length; i++) {
		const product = products[i];

		if (product.outOfStock) {
			const params = new URLSearchParams();
			params.append('catalogRefIds', product.catalogRefId);
			params.append('productId', product.productId);
			params.append('quantity', 1);

			await fetch(PURCHASE_URL, { method: 'POST', body: params })
	    .then(res => res.json())
	    .then(async json => {
	    	const isOnStock = json.responseTO.data;
	    	if (isOnStock) {
	    			let info = await transporter.sendMail({
				    from: email.from, // sender address
				    to: email.to, // list of receivers
				    subject: "YA HAY STOCK EN DECATHLON MUAJAJA ✔", // Subject line
				    text: `HAY UNIDADES DE ${product.name}`, // plain text body
				    html: `<b>HAY UNIDADES DE ${product.name}</b> 
				    <p> CORRE INSENSATO!! </p>
				    <p>	LINK: <a href="${product.link}">${product.link}</a> </p>`
			  	});
					product.outOfStock = false;
					console.log(moment().format(), `There is stock for -> ${product.name}. Email already sent`)
				} else {
					console.log(moment().format(), `No stock for -> ${product.name}.`)
				}
	    })
	    .catch(err => console.log(err));
		}
	}
}

setInterval(function () {
	init()
}, 5000);

