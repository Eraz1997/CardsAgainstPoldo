"use strict";
async function serverMain() {

	console.log("[+] Get requirements");
	const express = require("express");
	const dbManager = require("./app/Globals/dbManager.js");
	const bodyParser = require("body-parser");
	const constants = require("./app/Globals/constants.js");

	console.log("[+] Init app");
	const app = express();
	const router = express.Router();

	console.log("[+] Connect to database");
	await dbManager.init();

	console.log("[+] Link middlewares");
	app.use(function(req, res, next) {
		console.log("[!] " + req.method + " request at " + req.url + " from " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));
		next();
	});
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));

	console.log("[+] Get endpoints");
	const endpoints = require("./app/Node/endpoints.js");
	for (let filename of Object.keys(endpoints)) {
		let e = endpoints[filename];
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