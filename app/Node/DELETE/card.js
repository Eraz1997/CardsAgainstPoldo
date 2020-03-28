"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let success = false;
	let error = "";
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