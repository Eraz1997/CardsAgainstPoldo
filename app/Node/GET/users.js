"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;
	try {
		connection = await dbManager.connect();
		let users = await connection.models.users.select({}, ["nickname", "isMaster"]);
		await connection.closeConnection();

		response.status(200).send({
			users: users
		});

	} catch (err) {
		console.log(err);
		await connection.closeConnection();
		response.status(400).send({
			error: err
		});
	}
};