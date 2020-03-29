"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	try {
		await dbManager.connect();
		let blackCard = await dbManager.models.games.select({});

		if (!blackCard.length){
			throw "Nessun game presente!";
		}
		if (!blackCard[0].currentBlackCard){
			throw "Carta vuota!";
		}
		await dbManager.close();
		response.status(200).send(blackCard[0].currentBlackCard);
	} catch (err) {
		console.log(err);
		dbManager.close();
		response.status(200).send({
			error: err
		});
	}
};
