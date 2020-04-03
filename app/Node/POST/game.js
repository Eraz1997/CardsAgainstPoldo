"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {
		let userNickname = request.body.userNickname;

		if (!userNickname || userNickname === "") {
			throw "Parametro non presente";
		}
		connection = await dbManager.connect();
		let user = await connection.models.users.select({
			nickname: userNickname
		});
		if (!user.length) {
			throw "Giocatore non trovato";
		}
		user = user[0];
		if (!user.isMaster) {
			throw "Solo il master può far partire il gioco";
		}
		let games = await connection.models.games.select({});
		if (!games.length) {
			throw "Gioco non ancora creato";
		}
		let game = games[0];
		if (game.isStarted) {
			throw "Gioco già avviato";
		}
		await connection.models.games.modify({}, {
			isStarted: true
		});
		await connection.closeConnection();
		response.webSocketEvents.sendToAll("gameStarted");

		response.status(200).send({});
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};