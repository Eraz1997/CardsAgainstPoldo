"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	try {
		await dbManager.connect();
		let games = await dbManager.models.games.select({});
		if (!games.length || !games[0].isEnded) {
			throw "Partita non iniziata o non ancora conclusa";
		}
		let winner = await dbManager.models.users.select({}).reduce(function(best, current) {
			if (best === null || current.points > best.points) {
				return current;
			}
		}, null);
		if (!winner) {
			throw "Nessun giocatore trovato";
		}
		await dbManager.close();

		response.status(200).send(winner);

	} catch (err) {
		console.log(err);
		dbManager.close();

		response.status(200).send({
			error: err
		});
	}
};