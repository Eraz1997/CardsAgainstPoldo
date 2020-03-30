"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		let userNickname = request.query.userNickname;
		connection = await dbManager.connect();
		let users = await connection.models.users.select({
			nickname: userNickname
		}, ["nickname", "points", "isMaster", "response"]);
		if (!users.length) {
			throw "Utente non trovato";
		}
		let responses = users[0].response;
		if (responses && responses.length) {
			let fullResponse = [];
			for (let response of responses) {
				let fullCard = await connection.models.cards.select({
					uuid: response
				});
				if (!fullCard.length) {
					throw "Alcune carte non sono state trovate";
				}
				fullResponse.push(fullCard[0]);
			}
			users[0].response = fullResponse;
		}

		await connection.closeConnection();

		response.status(200).send(users[0]);

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};