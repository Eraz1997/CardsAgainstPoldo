"use strict";
const sha256 = require("js-sha256");
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let success = false;
	let error = "";
	try {
		let text = request.body.text;
		let isBlack = request.body.isBlack;

		if (!text || text === "") {
			throw "Testo non presente";
		}
		let uuid = sha256(text);
		await dbManager.connect();
		let existingCards = await dbManager.models.cards.select({
			uuid: uuid
		});
		if (existingCards.length) {
			throw "Carta già esistente";
		}
		await dbManager.models.cards.create({
			text: text,
			uuid: uuid,
			isBlack: isBlack
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