"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		connection = await dbManager.connect();
		let blackCard = await connection.models.games.select({});

		if (!blackCard.length) {
			throw "Nessun game presente!";
		}
		if (!blackCard[0].currentBlackCard) {
			throw "Carta vuota!";
		}
		await connection.closeConnection();
		response.status(200).send(blackCard[0].currentBlackCard);
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(200).send({
			error: err
		});
	}
};