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

		let games = await dbManager.models.games.select({});
		if (!games.length) {
			throw "Partita già chiusa";
		}
		let game = games[0];
		if (!game.isEnded && !user.isMaster) {
			throw "Solo il master può chiudere la partita";
		}
		await dbManager.models.games.destroy({});
		await dbManager.models.users.destroy({});
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