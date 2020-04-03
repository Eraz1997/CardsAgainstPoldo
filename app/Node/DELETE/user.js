"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {
		let userNickname = request.query.userNickname;

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
		let otherUsers = await connection.models.users.select({
			nickname: {
				$ne: userNickname
			}
		});

		let games = await connection.models.games.select({});
		if (!games.length) {
			throw "Errore di inconsistenza: gioco non trovato, ma utente presente";
		}
		let game = games[0];

		if (!otherUsers.length) {
			await connection.models.games.destroy({});
			await connection.models.users.destroy({});
		} else if (user.isMaster) {
			if (game.isStarted && !game.isEnded) {
				throw "Il master non può uscire dalla partita";
			} else if (!game.isStarted) {
				await connection.models.users.modify({
					nickname: otherUsers[0].nickname
				}, {
					isMaster: true
				});
			}
		}
		await connection.models.users.destroy({
			nickname: userNickname
		});
		await connection.closeConnection();
		response.webSocketEvents.sendToAll("userJoined");

		response.status(200).send({});
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};