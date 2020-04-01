"use strict";
async function serverMain() {

	console.log("[+] Get requirements");
	const express = require("express");
	const dbManager = require("./app/Globals/dbManager.js");
	const bodyParser = require("body-parser");
	const constants = require("./app/Globals/constants.js");
	const WebSocketServer = require("websocket").server;
	const http = require("http");

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

	console.log("[+] Start HTTP server");
	app.listen(constants.NODE_PORT);

	console.log("[+] Init WebSocket server");

	let wsServer = http.createServer(function(request, response) {
		console.log("[!] Received HTTP request in WS port");
		response.writeHead(404);
		response.end();
	});

	console.log("[+] Start WebSocket server");
	wsServer.listen(constants.WEB_SOCKET_PORT);
	let ws = new WebSocketServer({
		httpServer: wsServer,
		autoAcceptConnections: false
	});

	console.log("[+] Configure WS routes");

	const wsEndpoints = require("./app/WS/endpoints.js");
	let wsRoutes = {};
	for (let eventName of Object.keys(wsEndpoints)) {
		wsRoutes[eventName] = require("./app/WS/" + wsEndpoints[eventName] + ".js");
	}
	ws.on("request", function(request) {

		let connection = request.accept("echo-protocol", request.origin);
		console.log("[!] WS connection accepted");
		connection.on("message", function(message) {
			if (message.type === "utf8") {
				console.log("[!] WS subscription received: "); // + get event (use a specific language)
				// route to right wsRoute in wsRoutes, if present
				let messages = message.utf8Data.split(" ");
				let username = messages.length > 1 ? messages[0] : null;
				let eventName = messages.length > 1 ? messages[1] : messages[0];
				if (wsRoutes[eventName]) {
					connection.sendUTF(wsRoutes[eventName](username));
				} else {

					console.log("Received Message: " + message.utf8Data); // mock of response router
					connection.sendUTF(message.utf8Data); // mock of response router
					// handle error

				}
			}
		});
		connection.on("close", function() { //  reasonCode, description) {
			console.log("[!] " + connection.remoteAddress + " has lost WS connection.");
		});
	});

	console.log("[+] Working\n");
}

serverMain();