"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {

		connection = await dbManager.connect();

		await connection.models.games.destroy({});
		await connection.models.users.destroy({});
		await connection.closeConnection();

		response.status(200).send({});
	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};