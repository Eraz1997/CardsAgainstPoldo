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
	for (let filename of endpoints) {
		let method = filename.split("/")[0];
		let url = filename.split("/")[1];
		let endpoint = "./app/Node/" + filename + ".js";
		let handler = require(endpoint);
		if (method === "GET") {
			router.get(constants.NODE_PREFIX + url, handler);
		} else if (method === "POST") {
			router.post(constants.NODE_PREFIX + url, handler);
		} else if (method === "PUT") {
			router.put(constants.NODE_PREFIX + url, handler);
		} else if (method === "DELETE") {
			router.delete(constants.NODE_PREFIX + url, handler);
		}
	}
	app.use(router);

	console.log("[+] Load AngularJS application");
	app.use(express.static("."));

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
		let connection;
		try {
			connection = request.accept("cap-protocol", request.origin);
			console.log("[!] WS connection accepted");
		} catch (err) {
			console.log(err);
		}
		connection.on("message", function(message) {
			try {
				if (message.type === "utf8") {
					console.log("[!] WS subscription received: ");
					message = JSON.parse(message.utf8Data);
					//message.data = JSON.parse(message.data);
					if (wsRoutes[message.event]) {
						connection.sendUTF(wsRoutes[message.event](message.data));
					} else {
						console.log("Received Message: " + JSON.stringify(message)); // mock of response router
						connection.sendUTF(JSON.stringify(message)); // mock of response router
						// handle error
					}
				}
			} catch (err) {
				console.log(err);
			}

		});
		connection.on("close", function() { //  reasonCode, description) {
			console.log("[!] " + connection.remoteAddress + " has lost WS connection.");
		});
	});

	console.log("[+] Working\n");
}

serverMain();