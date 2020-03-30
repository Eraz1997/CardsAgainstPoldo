"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		connection = await dbManager.connect();
		let games = await connection.models.games.select({});
		if (!games.length || !games[0].currentBlackCard) {
			throw "Nessun turno è stato ancora giocato";
		}
		await connection.closeConnection();

		response.status(200).send({
			turn: games[0].turn
		});

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};