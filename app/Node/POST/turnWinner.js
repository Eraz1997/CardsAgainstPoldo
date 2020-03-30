"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {

		let userNickname = request.body.userNickname;
		let cardUUIDs = request.body.cardUUIDs;

		if (!userNickname || userNickname === "" || !cardUUIDs || cardUUIDs.filter(function(c) {
				return c === "";
			}).length) {
			throw "Parametri non presenti";
		}

		connection = await dbManager.connect();

		let user = await connection.models.users.select({
			nickname: userNickname
		});
		if (!user.length) {
			throw "Utente non trovato";
		}

		let turnWinner = await connection.models.users.select({
			response: cardUUIDs
		});
		if (!turnWinner.length) {
			throw "Carte non trovate";
		}
		turnWinner = turnWinner[0];

		let games = await connection.models.games.select({});
		if (!games.length || !games[0].isStarted) {
			throw "Gioco non trovato";
		}

		let whiteCards = games[0].whiteDeck;
		let blackCards = games[0].blackDeck;
		let players = await connection.models.users.select({
			nickname: {
				$ne: userNickname
			}
		});


		if (blackCards.length && whiteCards.length >= players.length * cardUUIDs.length) {
			let newBlackCard = blackCards[0];
			blackCards.shift();

			for (let player of players) {
				player.cards = player.cards.concat(whiteCards.splice(0, cardUUIDs.length));
				await connection.models.users.modify({
					nickname: player.nickname
				}, {
					cards: player.cards,
					response: null
				});
			}

			await connection.models.games.modify({}, {
				currentBlackCard: newBlackCard,
				turnWinner: turnWinner.nickname,
				turnWinnerCards: cardUUIDs,
				blackDeck: blackCards,
				whiteDeck: whiteCards,
				turn: games[0].turn + 1
			});

		} else {
			await connection.models.games.modify({}, {
				isEnded: true
			});
		}

		await connection.models.users.modify({
			nickname: turnWinner.nickname
		}, {
			points: turnWinner.points + 1,
			isMaster: true,
			response: null
		});
		await connection.models.users.modify({
			nickname: userNickname
		}, {
			isMaster: false
		});

		await connection.closeConnection();
		response.status(200).send({});
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};