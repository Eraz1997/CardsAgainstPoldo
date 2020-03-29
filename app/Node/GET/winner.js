"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		connection = await dbManager.connect();
		let games = await connection.models.games.select({});
		if (!games.length || !games[0].isEnded) {
			throw "Partita non iniziata o non ancora conclusa";
		}
		let users = await connection.models.users.select({}, ["nickname", "points"], "points", "DESC");
		if (!users.length) {
			throw "Nessun giocatore trovato";
		}
		let winner = users.reduce(function(best, current) {
			if (best === null || current.points > best.points) {
				return current;
			}
		}, null);
		await connection.closeConnection();

		response.status(200).send({
			winner: winner,
			scoreboard: users
		});

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};