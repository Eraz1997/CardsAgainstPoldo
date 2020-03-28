"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let success = false;
	let error = "";
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

		let games = await dbManager.models.games.select({});
		if (!games.length) {
			success = true;
			throw "Partita già chiusa";
		}
		let game = games[0];
		if (!game.isEnded && !user.isMaster) {
			throw "Solo il master può chiudere la partita";
		}
		await dbManager.models.games.destroy({});
		await dbManager.models.users.destroy({});
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