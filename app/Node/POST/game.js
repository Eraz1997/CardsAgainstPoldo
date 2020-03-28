"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let success = false;
	let error = "";
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
		success = true;

	} catch (err) {
		console.log(err);
		dbManager.close();
		error = err;
	}

	response.status(200).send({
		success: success,
		error: error
	});
};