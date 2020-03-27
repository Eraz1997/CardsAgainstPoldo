"use strict";

function serverMain() {

	const express = require('express');
	//const bodyParser = require('body-parser');
	const mongoose = require('mongoose');
	const app = express();
	const router = express.Router();

	const mongoURL = 'mongodb://localhost/testdb';
	mongoose.connect(mongoURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	app.use(express.static('Web/test'));

	router.get('/api', (request, response) => {
		response.status(200).send({
			message: 'Hello World!'
		});
	});
	app.use(router);

	const port = 3000;

	app.listen(port);
	console.log(`Server is running on port: ${port}`);

}

serverMain();