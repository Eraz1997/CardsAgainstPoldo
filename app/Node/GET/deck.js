"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	try {
		await dbManager.connect();
		let deck = await dbManager.models.cards.select({});
		await dbManager.close();
		response.status(200).send(deck);
	} catch (err) {
		console.log(err);
		dbManager.close();
		response.status(200).send({
			error: err
		});
	}
};