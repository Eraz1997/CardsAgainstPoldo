"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {

	try {
		let userNickname = request.query.userNickname;

		if (!userNickname || userNickname === "") {
			throw "Parametro non presente";
		}
		await dbManager.connect();

		let user = await dbManager.models.users.select({
			nickname: userNickname
		});
		if (!user.length) {
			throw "Giocatore non trovato";
		}
		user = user[0];
		let otherUsers = await dbManager.models.users.select({
			nickname: {
				$ne: userNickname
			}
		});

		let games = await dbManager.models.games.select({});
		if (!games.length) {
			throw "Errore di inconsistenza: gioco non trovato, ma utente presente";
		}
		let game = games[0];

		if (!otherUsers.length) {
			await dbManager.models.games.destroy({});
			await dbManager.models.users.destroy({});
		} else if (user.isMaster) {
			if (game.isStarted && !game.isEnded) {
				throw "Il master non può uscire dalla partita";
			} else if (!game.isStarted) {
				await dbManager.models.users.modify({
					nickname: otherUsers[0].nickname
				}, {
					isMaster: true
				});
			}
		}
		await dbManager.models.users.destroy({
			nickname: userNickname
		});
		await dbManager.close();

		response.status(200).send({});
	} catch (err) {
		dbManager.close();
		response.status(400).send({
			error: err
		});
	}
};