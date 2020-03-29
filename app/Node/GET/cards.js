"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {

	try {
		let userNickname = request.query.userNickname;

		await dbManager.connect();

		let games = await dbManager.models.games.select({});
		if (!games.length || !games[0].isStarted || games[0].isEnded) {
			throw "Partita ancora non iniziata o già conclusa";
		}

		let user = await dbManager.models.users.select({
			nickname: userNickname
		});
		if (!user) {
			throw "Utente non trovato";
		}
		if (user.isMaster) {
			throw "Il master non può giocare carte bianche";
		}

		await dbManager.close();

		response.status(200).send(user.cards);

	} catch (err) {
		console.log(err);
		dbManager.close();

		response.status(200).send({
			error: err
		});
	}
};