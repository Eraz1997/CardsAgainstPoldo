"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {

	try {

		let userNickname = request.body.userNickname;
		let cardUUIDs = request.body.cardUUIDs;

		if (!userNickname || userNickname === "" || !cardUUIDs || cardUUIDs.filter(function(c) {
				return c === "";
			}).length) {
			throw "Parametri non presenti";
		}

		await dbManager.connect();

		let user = await dbManager.models.users.select({
			nickname: userNickname
		});
		if (!user.length) {
			throw "Utente non trovato";
		}

		let turnWinner = await dbManager.models.users.select({
			response: cardUUIDs
		});
		if (!turnWinner.length) {
			throw "Carte non trovate";
		}

		let games = await dbManager.models.games.select({});
		if (!games.length || !games[0].isStarted) {
			throw "Gioco non trovato";
		}

		let whiteCards = games[0].whiteDeck;
		let blackCards = games[0].blackDeck;
		let players = await dbManager.models.users.select({
			nickname: {
				$ne: userNickname
			}
		});


		if (blackCards.length && whiteCards.length >= players.length * cardUUIDs.length) {
			let newBlackCard = blackCards[0];
			blackCards.shift();

			await players.map(async function(player) {
				player.cards = player.cards.concat(whiteCards.splice(0, cardUUIDs.length));
				await dbManager.models.users.modify({
					nickname: player.nickname
				}, {
					cards: player.cards,
					response: null
				});
			});

			await dbManager.models.games.modify({}, {
				currentBlackCard: newBlackCard,
				turnWinner: turnWinner.nickname,
				turnWinnerCard: cardUUIDs,
				blackDeck: blackCards,
				whiteDeck: whiteCards
			});

		} else {
			await dbManager.models.games.modify({}, {
				isEnded: true
			});
		}

		await dbManager.models.users.modify({
			nickname: turnWinner.nickname
		}, {
			points: turnWinner.points + 1,
			isMaster: true,
			response: null
		});
		await dbManager.models.users.modify({
			nickname: userNickname
		}, {
			isMaster: false
		});

		await dbManager.close();
		response.status(200).send({});
	} catch (err) {
		dbManager.close();
		response.status(400).send({
			error: err
		});
	}
};