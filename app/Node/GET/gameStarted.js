"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		connection = await dbManager.connect();
		let games = await connection.models.games.select({});
		let result = !!(games.length && games[0].isStarted);
		await connection.closeConnection();

		response.status(200).send({
			started: result
		});

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};