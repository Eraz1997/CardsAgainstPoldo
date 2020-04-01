"use strict";

var WebSocketServer = require("websocket").server;

let ws = {};

ws.start = function(httpServer) {
	ws.server = new WebSocketServer({
		httpServer: httpServer,
		autoAcceptConnections: false
	});

	ws.on("request", function(request) {
		if (!ws.originAllowed(request)) {
			request.reject();
			console.log("[!] Connection rejected.");
			return;
		}

		var connection = request.accept("echo-protocol", request.origin);
		console.log("[!] Connection accepted.");
		connection.on("message", function(message) {
			if (message.type === "utf8") {
				console.log("Received Message: " + message.utf8Data);
				connection.sendUTF(message.utf8Data); // mock of response router
			}
		});
		connection.on("close", function() { //  reasonCode, description) {
			console.log("Peer " + connection.remoteAddress + " disconnected.");
		});
	});
};

ws.originAllowed = function(request) {
	return !!request.origin;
};

module.exports = ws;