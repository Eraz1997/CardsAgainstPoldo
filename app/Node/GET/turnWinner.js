"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		connection = await dbManager.connect();
		let games = await connection.models.games.select({});
		if (!games.length || !games[0].currentBlackCard) {
			throw "Nessun turno è stato ancora giocato";
		}

		let winner;
		let scoreboard;
		let winnerCards;
		if (games[0].turnWinner && games[0].turnWinnerCards) {
			winner = await connection.models.users.select({
				nickname: games[0].turnWinner
			}, ["nickname"]);
			if (!winner) {
				throw "Giocatore non trovato";
			}
			winnerCards = games[0].turnWinnerCards.map(async function(card) {
				return await connection.models.cards.select({
					uuid: card,
					isBlack: false
				});
			});
			if (!winnerCards) {
				throw "Carta non trovata";
			}
			scoreboard = await connection.models.users.select({}, ["nickname", "points"], "points", "DESC");
		}

		await connection.closeConnection();

		response.status(200).send({
			winner: winner,
			winnerCards: winnerCards,
			scoreboard: scoreboard,
			turn: games[0].turn
		});

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};
