"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	try {
		await dbManager.connect();
		let deck = await dbManager.models.cards.select({});
		let whiteDeck = deck.filter(function(item) {
			return !item.isBlack;
		});
		let blackDeck = deck.filter(function(item) {
			return item.isBlack;
		});
		await dbManager.close();
		response.status(200).send({
			whiteDeck: whiteDeck,
			blackDeck: blackDeck
		});
	} catch (err) {
		dbManager.close();
		response.status(400).send({
			error: err
		});
	}
};