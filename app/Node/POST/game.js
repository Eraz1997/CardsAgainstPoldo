"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {

	try {
		let userNickname = request.body.userNickname;

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
		if (!user.isMaster) {
			throw "Solo il master può far partire il gioco";
		}
		let games = await dbManager.models.games.select({});
		if (!games.length) {
			throw "Gioco non ancora creato";
		}
		let game = games[0];
		if (game.isStarted) {
			throw "Gioco già avviato";
		}
		await dbManager.models.games.modify({}, {
			isStarted: true
		});
		await dbManager.close();

		response.status(200).send({});
	} catch (err) {
		console.log(err);
		await dbManager.close();
		response.status(400).send({
			error: err
		});
	}
};