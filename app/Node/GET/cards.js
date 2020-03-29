"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {
		let userNickname = request.query.userNickname;

		connection = await dbManager.connect();

		let games = await connection.models.games.select({});
		if (!games.length || !games[0].isStarted || games[0].isEnded) {
			throw "Partita ancora non iniziata o già conclusa";
		}

		let user = await connection.models.users.select({
			nickname: userNickname
		});
		if (!user) {
			throw "Utente non trovato";
		}
		if (user.isMaster) {
			throw "Il master non può giocare carte bianche";
		}

		await connection.closeConnection();

		response.status(200).send(user.cards);

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};