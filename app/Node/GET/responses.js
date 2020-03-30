"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		let userNickname = request.query.userNickname;

		connection = await dbManager.connect();
		let games = await connection.models.games.select({});
		if (!games.length || !games[0].isStarted || games[0].isEnded) {
			throw "Partita ancora non iniziata o già conclusa";
		}
		let user = await connection.models.users.select({
			nickname: userNickname
		}, ["isMaster"]);
		if (!user.length || !user[0].isMaster) {
			throw "Utente non trovato o non avente il diritto di leggere le risposte in questo turno";
		}
		let responses = await connection.models.users.select({
			nickname: {
				$ne: userNickname
			}
		}, ["response"]);
		let fullResponses = [];
		for (let response of responses) {
			let fullResponse = [];
			response = response.response;
			if (!response || !response.length) {
				continue;
			}
			for (let card of response) {
				let fullCard = await connection.models.cards.select({
					uuid: card
				});
				if (!fullCard.length) {
					throw "Alcune carte non sono state trovate";
				}
				fullResponse.push(fullCard[0]);
			}
			fullResponses.push(fullResponse);
		}

		let pendingResponses = (await connection.models.users.select({}, ["nickname"])).length - 1 - fullResponses.length;
		if (pendingResponses < 0) {
			throw "Qualcosa è andato storto: risposte ricevute maggiori rispetto al numero di utenti in partita";
		}
		await connection.closeConnection();

		response.status(200).send({
			responses: fullResponses,
			pendingResponses: pendingResponses
		});

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};