"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	try {
		await dbManager.connect();
		let users = await dbManager.models.users.select({}, ["nickname", "isMaster"]);
		await dbManager.close();

		response.status(200).send({
			users: users
		});

	} catch (err) {
		console.log(err);
		await dbManager.close();
		response.status(400).send({
			error: err
		});
	}
};