"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let success = false;
	let error = "";
	try {
		let nick = request.body.nickname;
		let cards = [];
		let isMaster = false;

		if (!nick || nick === ""){
		throw "Nickname non inserito";
		}
		await dbManager.connect();
		cards = await dbManager.models.cards.select({isBlack:false});
		cards.sort(function(a,b){
			return 0.5 - Math.random()
		});
		console.log(cards);

		//await dbManager.models.users.destroy({}); //PER RIPULIRE IL DATABASE IN FASE DI TEST
 	 	let checkMaster = await dbManager.models.users.select({});
 		if(checkMaster.length === 0){
			isMaster = true;
		}

		await dbManager.models.users.create({
			nickname: nick,
			cards: cards.slice(0,10),
			points: 0,
			isMaster: false,
		});
		console.log(await dbManager.models.users.select({}));
		console.log(isMaster);
		await dbManager.close();
		success = true;

	} catch (err) {
			console.log(err);
			dbManager.close();
			error = err;
		}

		response.status(200).send({
			success: success,
			error: error
		});
};
