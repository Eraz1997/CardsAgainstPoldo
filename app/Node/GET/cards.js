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
		});
		if (!user) {
			throw "Utente non trovato";
		}
		user = user[0];
		if (user.isMaster) {
			throw "Il master non può giocare carte bianche";
		}

		let fullCards = [];
		for (let card of user.cards) {
			let fullCard = await connection.models.cards.select({
				uuid: card
			});
			if (!fullCard.length) {
				throw "Carte non trovate";
			}
			fullCards.push(fullCard[0]);
		}

		await connection.closeConnection();

		response.status(200).send(fullCards);

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};