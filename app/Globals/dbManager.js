"use strict";
const Schemas = require("./schemas.js");
const mongoose = require("mongoose");

let dbManager = {};
dbManager.databaseURL = "mongodb://localhost/cardsagainstpoldo";

var createFunction = function(model) {

	return async function(object) {
		let obj = new model(object);
		await obj.save();
	};
};

var selectFunction = function(model) {

	return async function(query, projection, sortAttribute, sortDirection) {
		let sortDir = sortDirection === "ASC" ? 1 : -1;
		if (sortAttribute && sortDirection) {
			return await model.find(query, projection).sort({
				sortAttribute: sortDir
			}).exec();
		}
		return await model.find(query, projection).exec();
	};
};

var modifyFunction = function(model) {

	return async function(query, object) {
		return await model.updateMany(query, {
			$set: object
		}, {
			multi: true
		});
	};
};

var destroyFunction = function(model) {

	return async function(query) {
		return await model.deleteMany(query);
	};
};

dbManager.getModels = async function() {
	dbManager.models = {};
	for (let key of Object.keys(Schemas)) {
		dbManager.models[key + "s"] = await mongoose.model(key, Schemas[key]);
		dbManager.models[key + "s"].create = createFunction(dbManager.models[key + "s"]);
		dbManager.models[key + "s"].select = selectFunction(dbManager.models[key + "s"]);
		dbManager.models[key + "s"].modify = modifyFunction(dbManager.models[key + "s"]);
		dbManager.models[key + "s"].destroy = destroyFunction(dbManager.models[key + "s"]);
	}
};

dbManager.connect = async function() {
	await mongoose.connect(dbManager.databaseURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	});
	dbManager.db = mongoose.connection;
	dbManager.db.on('error', console.error.bind(console, 'MongoDB error:'));
	await dbManager.getModels();
};

dbManager.close = async function() {
	await dbManager.db.close();
};

dbManager.init = async function() {
	try {
		await dbManager.connect();
		await dbManager.close();
	} catch (err) {
		console.log(err);
	}
};

module.exports = dbManager;

/*
	Usage:
	const dbManager = require("../../Globals/dbManager.js");
	try {
		await dbManager.connect();
		await dbManager.models.users.create({nickname: "pippo", cards: [], points: 0, isMaster: false});
		let user = await dbManager.models.users.select({nickname: "gianni"});	// restituisce sempre un array di oggetti
		await dbManager.models.users.modify({nickname: "gianni"}, {points: 100, isMaster: true});
		await dbManager.models.users.destroy({nickame: "pippo"});
		await dbManager.close();
	} catch (err) {
		console.log(err);
	}
*/