"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		connection = await dbManager.connect();
		let games = await connection.models.games.select({});

		if (!games.length) {
			throw "Nessun game presente!";
		}
		if (!games[0].currentBlackCard) {
			throw "Carta vuota!";
		}
		let blackCard = await connection.models.cards.select({
			uuid: games[0].currentBlackCard
		});
		if (!blackCard.length) {
			throw "Carta non trovata";
		}
		await connection.closeConnection();
		response.status(200).send(blackCard[0]);
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};