"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let success = false;
	let error = "";

	try {
		let nick = request.body.nickname;
		let cards = [];
		let isMaster = false;

		if (!nick || nick === "") {
			throw "Nickname non inserito";
		}
		await dbManager.connect();

		//await dbManager.models.users.destroy({}); //PER RIPULIRE IL DATABASE IN FASE DI TEST
		let checkMaster = await dbManager.models.users.select({}, ["nickname"]);
		if (checkMaster.length === 0) {
			isMaster = true;
		}

		if (isMaster) {
			let whiteDeck = (await dbManager.models.cards.select({
				isBlack: false
			})).map(function(item) {
				return item.uuid;
			});
			let blackDeck = (await dbManager.models.cards.select({
				isBlack: true
			})).map(function(item) {
				return item.uuid;
			});
			whiteDeck.sort(function() {
				return 0.5 - Math.random();
			});
			blackDeck.sort(function() {
				return 0.5 - Math.random();
			});
			cards = whiteDeck.splice(0, 10);
			//console.log(cards);
			await dbManager.models.games.destroy({});
			await dbManager.models.games.create({
				whiteDeck: whiteDeck,
				blackDeck: blackDeck,
				isStarted: false,
				isEnded: false,
				turnWinner: null,
				turnWinnerCards: null,
				currentBlackCard: null
			});
		} else {
			let games = await dbManager.models.games.select({});
			if (!games.length) {
				throw "Errore, gioco non trovato";
			}
			let whiteDeck = games[0].whiteDeck;
			cards = whiteDeck.splice(0, 10);
			await dbManager.models.games.modify({}, {
				whiteDeck: whiteDeck
			});
		}

		await dbManager.models.users.create({
			nickname: nick,
			cards: cards,
			points: 0,
			isMaster: isMaster,
			response: null
		});


		//console.log(await dbManager.models.users.select({}));
		//console.log(isMaster);
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
