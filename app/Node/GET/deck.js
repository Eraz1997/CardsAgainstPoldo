"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		connection = await dbManager.connect();
		let deck = await connection.models.cards.select({});
		let whiteDeck = deck.filter(function(item) {
			return !item.isBlack;
		});
		let blackDeck = deck.filter(function(item) {
			return item.isBlack;
		});
		await connection.closeConnection();
		response.status(200).send({
			whiteDeck: whiteDeck,
			blackDeck: blackDeck
		});
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};