"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {
		let userNickname = request.body.userNickname;
		let cards = request.body.cards;

		if (!userNickname || userNickname === "" || !cards || cards === "" || !cards.length) {
			throw "Parametro non presente";
		}
		cards = cards.map(function(card) {
			return card.uuid;
		});
		connection = await dbManager.connect();
		let user = await connection.models.users.select({
			nickname: userNickname
		});
		if (!user.length) {
			throw "Giocatore non trovato";
		}
		if (user.isMaster) {
			throw "Il master non può dare risposte";
		}
		let games = await connection.models.games.select({});
		if (!games.length || !games[0].isStarted || !games[0].currentBlackCard || games[0].isEnded) {
			throw "Gioco non ancora creato";
		}
		let game = games[0];
		let blackCard = await connection.models.cards.select({
			uuid: game.currentBlackCard
		});
		blackCard = blackCard[0];
		if (user.response) {
			throw "Risposta già inviata";
		}
		user = user[0];
		if (cards.filter(function(card) {
				return user.cards.includes(card);
			}).length !== cards.length) {
			throw "Non puoi usare carte che non possiedi";
		}
		if (cards.filter(function(card, index) {
				return cards.indexOf(card) !== index;
			}).length) {
			throw "Non puoi usare due volte la stessa carta";
		}
		if (blackCard.text.split("_").length - 1 !== cards.length) {
			throw "Numero di carte sbagliato";
		}

		let userUpdatedCards = user.cards.filter(function(card) {
			return !cards.includes(card);
		});

		await connection.models.users.modify({
			nickname: userNickname
		}, {
			cards: userUpdatedCards,
			response: cards
		});

		let players = await connection.models.users.select({}, ["nickname", "response"]);
		let responses = players.filter(function(player) {
			return !!player.response && !!player.response.length;
		});

		await connection.closeConnection();

		if (players.length - 1 === responses.length) {
			response.webSocketEvents.sendToAll("playerResponses");
		}

		response.status(200).send({});
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};