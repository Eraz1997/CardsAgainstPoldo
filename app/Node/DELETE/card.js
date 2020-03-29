"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {
		let uuid = request.query.uuid;

		if (!uuid || uuid === "") {
			throw "Identificativo carta non presente";
		}
		connection = await dbManager.connect();
		let existingCards = await connection.models.cards.select({
			uuid: uuid
		});
		if (!existingCards.length) {
			throw "Carta non trovata";
		}
		await connection.models.cards.destroy({
			uuid: uuid
		});
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