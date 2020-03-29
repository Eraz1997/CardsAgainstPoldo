"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	try {
		await dbManager.connect();
		let games = await dbManager.models.games.select({});
		let result = !!(games.length && games[0].isStarted);
		await dbManager.close();

		response.status(200).send({
			started: result
		});

	} catch (err) {
		console.log(err);
		await dbManager.close();
		response.status(400).send({
			error: err
		});
	}
};