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

		let games = await connection.models.games.select({});
		if (!games.length) {
			throw "Partita già chiusa";
		}
		let game = games[0];
		if (!game.isEnded && !user.isMaster) {
			throw "Solo il master può chiudere la partita";
		}
		await connection.models.games.destroy({});
		await connection.models.users.destroy({});
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