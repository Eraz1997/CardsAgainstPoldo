"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		let userNickname = request.query.userNickname;
		connection = await dbManager.connect();
		let users = await connection.models.users.select({
			userNickname
		}, ["nickname", "points", "isMaster"]);
		if (!users.length) {
			throw "Utente non trovato";
		}
		await connection.closeConnection();

		response.status(200).send({
			users: users[0]
		});

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};