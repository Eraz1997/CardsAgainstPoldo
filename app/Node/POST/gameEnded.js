"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {

		let userNickname = request.body.userNickname;

		if (!userNickname || userNickname === "") {
			throw "Parametri non presenti";
		}

		connection = await dbManager.connect();

		let user = await connection.models.users.select({
			nickname: userNickname
		});
		if (!user.length) {
			throw "Utente non trovato";
		}
		user = user[0];
		let games = await connection.models.games.select({});
		if (!games.length || !games[0].isStarted) {
			throw "Gioco non trovato";
		}

		if (user.isMaster) {
			await connection.models.games.modify({}, {
				isEnded: true
			});
		} else {
			throw "Solo il master può terminare la partita";
		}

		await connection.closeConnection();
		response.status(200).send({});
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};