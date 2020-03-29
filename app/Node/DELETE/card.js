"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {

	try {
		let uuid = request.query.uuid;

		if (!uuid || uuid === "") {
			throw "Identificativo carta non presente";
		}
		await dbManager.connect();
		let existingCards = await dbManager.models.cards.select({
			uuid: uuid
		});
		if (!existingCards.length) {
			throw "Carta non trovata";
		}
		await dbManager.models.cards.destroy({
			uuid: uuid
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