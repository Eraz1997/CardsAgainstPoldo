"use strict";

function serverMain() {

	console.log("[+] Get requirements");
	const express = require("express");
	const mongoose = require("mongoose");
	// const bodyParser = require("body-parser"); // it may be useful later
	const constants = require("./app/Globals/constants.js");

	console.log("[+] Init app");
	const app = express();
	const router = express.Router();

	console.log("[+] Connect to database");
	const mongoURL = "mongodb://localhost/cardsagainstpoldo";
	mongoose.connect(mongoURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});

	console.log("[+] Get endpoints");
	const endpoints = require("./app/Node/endpoints.js");
	for (let e of Object.keys(endpoints)) {
		let filename = endpoints[e];
		let method = filename.split("/")[0];
		let endpoint = "./app/Node/" + filename + ".js";
		let handler = require(endpoint);
		if (method === "GET") {
			router.get(constants.NODE_PREFIX + e, handler);
		} else if (method === "POST") {
			router.post(constants.NODE_PREFIX + e, handler);
		} else if (method === "PUT") {
			router.put(constants.NODE_PREFIX + e, handler);
		} else if (method === "DELETE") {
			router.delete(constants.NODE_PREFIX + e, handler);
		}
	}
	app.use(router);

	console.log("[+] Get pages");
	const pages = require("./app/Web/pages.js");
	for (let p of Object.keys(pages)) {
		let filename = pages[p];
		let page = "app/Web/" + filename;
		app.use(constants.WEB_PREFIX + p, express.static(page));
	}

	console.log("[+] Start");
	app.listen(constants.NODE_PORT);

	console.log("[+] Running");
}

serverMain();