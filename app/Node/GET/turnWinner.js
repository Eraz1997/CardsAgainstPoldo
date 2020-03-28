"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	try {
		await dbManager.connect();
		let games = await dbManager.models.games.select({});
		if (!games.length || !games[0].turnWinner || !games[0].turnWinnerCard || !games[0].currentBlackCard) {
			throw "Nessun turno è stato ancora giocato";
		}
		let winner = await dbManager.models.users.select({
			nickname: games[0].turnWinner
		}, ["nickname"]);
		if (!winner) {
			throw "Giocatore non trovato";
		}
		let winnerCard = await dbManager.models.cards.select({
			uuid: games[0].turnWinnerCard,
			isBlack: false
		});
		if (!winnerCard) {
			throw "Carta non trovata";
		}
		let scoreboard = await dbManager.models.users.select({}, ["nickname", "points"], "points", "DESC");
		await dbManager.close();

		response.status(200).send({
			winner: winner,
			blackCard: games[0].currentBlackCard,
			winnerCard: winnerCard,
			scoreboard: scoreboard
		});

	} catch (err) {
		console.log(err);
		dbManager.close();

		response.status(200).send({
			error: err
		});
	}
};