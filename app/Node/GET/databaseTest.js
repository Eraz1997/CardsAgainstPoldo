"use strict";
const dbManager = require("../../Globals/dbManager.js");
module.exports = async function(request, response) {

	try {
		await dbManager.connect();
		await dbManager.models.users.create({
			nickname: "Paolo",
			cards: [],
			points: 100,
			isMaster: false
		});
		console.log(await dbManager.models.users.select({
			nickname: "Paolo"
		}));
		await dbManager.models.users.modify({
			nickname: "Paolo"
		}, {
			points: 200
		});
		console.log(await dbManager.models.users.select({
			nickname: "Paolo"
		}));
		await dbManager.models.users.destroy({
			nickname: "Paolo"
		});
		console.log(await dbManager.models.users.select({
			nickname: "Paolo"
		}));

		await dbManager.models.cards.create({
			text: "Pierino fa la cacca",
			uuid: "762",
			isBlack: false
		});
		await dbManager.models.cards.create({
			text: "Pierino fa la cacca",
			uuid: "781",
			isBlack: false
		});

		response.status(200).send(await dbManager.models.cards.select({
			text: "Pierino fa la cacca",
			uuid: "762",
			isBlack: false
		}));
	} catch (err) {
		console.log(err);
	}

};