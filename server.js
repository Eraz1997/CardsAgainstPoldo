"use strict";

function serverMain() {

	const express = require("express");
	//const bodyParser = require("body-parser");
	const mongoose = require("mongoose");
	const app = express();
	const router = express.Router();

	const mongoURL = "mongodb://localhost/testdb";
	mongoose.connect(mongoURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	app.use(express.static("app/Web/test"));

	let handler = require("./app/Node/test/test.js");

	router.get("/api", handler);
	app.use(router);

	const port = 3000;

	app.listen(port);
	console.log(`Server is running on port: ${port}`);

}

serverMain();