"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	try {
		let userNickname = request.query.userNickname;

		await dbManager.connect();
		let games = await dbManager.models.games.select({});
		if (!games.length || !games[0].isStarted || games[0].isEnded) {
			throw "Partita ancora non iniziata o già conclusa";
		}
		let user = await dbManager.models.users.select({
			nickname: userNickname
		}, ["isMaster"]);
		if (!user || !user.isMaster) {
			throw "Utente non trovato o non avente il diritto di leggere le risposte in questo turno";
		}
		let responses = await dbManager.models.users.select({
			nickname: {
				$ne: userNickname
			}
		}, ["response"]).map(function(item) {
			return item.response;
		});
		let pendingResponses = await dbManager.models.users.select({}, ["nickname"]).length - 1 - responses.length;
		if (pendingResponses < 0) {
			throw "Qualcosa è andato storto: risposte ricevute maggiori rispetto al numero di utenti in partita";
		}
		await dbManager.close();

		response.status(200).send({
			responses: responses,
			pendingResponses: pendingResponses
		});

	} catch (err) {
		dbManager.close();
		response.status(400).send({
			error: err
		});
	}
};