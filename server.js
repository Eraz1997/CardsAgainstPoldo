"use strict";
async function serverMain() {

	console.log("[+] Get requirements");
	const express = require("express");
	const dbManager = require("./app/Globals/dbManager.js");
	const bodyParser = require("body-parser");
	const constants = require("./app/Globals/constants.js");
	const wsAcceptedEvents = require("./app/Globals/webSocketEvents.js");
	const wsUnsubscribeEvents = wsAcceptedEvents.map(function(wsEvent) {
		return "~" + wsEvent;
	});
	const WebSocketServer = require("websocket").server;
	const http = require("http");


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

	console.log("[+] Configure WS events");

	let wsEvents = {};
	wsEvents.sendToAll = function(eventName, data) {
		if (eventName === "sendToAll") {
			return;
		}
		for (let client of wsEvents[eventName]) {
			console.log("[!] WS response to " + client.connection.remoteAddress + ": " + eventName);
			client.connection.sendUTF(JSON.stringify({
				event: eventName,
				data: data
			}));
		}
	};

	let sendFactory = function(connection, eventName) {
		return function(data) {
			console.log("[!] WS response to all: " + eventName);
			connection.sendUTF(JSON.stringify({
				event: eventName,
				data: data
			}));
		};
	};

	ws.on("request", function(request) {

		let connection;

		try {
			if (!request.protocolFullCaseMap["cap-protocol"]) {
				request.reject();
				throw "[!!] Bad WS protocol!";
			}

			connection = request.accept("cap-protocol", request.origin);
			console.log("[!] WS connection accepted");

			connection.on("message", function(message) {
				try {
					if (message.type !== "utf8") {
						throw "[!!] Bas WS message format!";
					}
					message = JSON.parse(message.utf8Data);
					if (!message.event) {
						throw "[!!] Bad WS message format!";
					}
					if (wsUnsubscribeEvents.includes(message.event)) {
						let wsEvent = message.event.substring(1);
						let oldLen = wsEvents[wsEvent].length;
						wsEvents[wsEvent] = wsEvents[wsEvent].filter(function(client) {
							return client.connection.remoteAddress !== connection.remoteAddress;
						});
						if (oldLen === wsEvents[wsEvent].length) {
							throw "[!] WS unsubscription failed";
						}
						console.log("[!] WS unsubscription: " + wsEvent + " from " + connection.remoteAddress);
						return;
					} else if (!wsAcceptedEvents.includes(message.event)) {
						throw "[!!] Bad WS event!";
					}
					console.log("[!] WS subscription received: " + message.event);

					if (wsEvents[message.event]) {
						wsEvents[message.event].push({
							connection: connection,
							send: sendFactory(connection, message.event),
							nickname: message.data || ""
						});
					} else {
						wsEvents[message.event] = [{
							connection: connection,
							send: sendFactory(connection, message.event),
							nickname: message.data || ""
						}];
					}
				} catch (err) {
					console.log(err);
				}
			});

			connection.on("close", function() {
				console.log("[!] " + connection.remoteAddress + " has lost WS connection.");
				const filterFunction = function(client) {
					return client.connection.remoteAddress !== connection.remoteAddress;
				};
				for (let wsEventKey of Object.keys(wsEvents)) {
					if (wsEventKey === "sendToAll") {
						continue;
					}
					wsEvents[wsEventKey] = wsEvents[wsEventKey].filter(filterFunction);
				}
			});

		} catch (err) {
			console.log(err);
		}
	});

	console.log("[+] Init HTTP server");
	const app = express();
	const router = express.Router();

	console.log("[+] Connect to database");
	await dbManager.init();

	console.log("[+] Link middlewares");
	app.use(function(req, res, next) {
		console.log("[!] " + req.method + " request at " + req.url + " from " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));
		res.webSocketEvents = wsEvents; // [IMPORTANT!!]
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

	console.log("[+] Working\n");
}

serverMain();