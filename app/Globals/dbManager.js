"use strict";
const Schemas = require("./schemas.js");
const mongoose = require("mongoose");

let dbManager = {};
dbManager.databaseURL = "mongodb://localhost/cardsagainstpoldo";

var createFunctionFactory = function(model) {

	return async function(object) {
		let obj = new model(object);
		await obj.save();
	};
};

var selectFunctionFactory = function(model) {

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

var modifyFunctionFactory = function(model) {

	return async function(query, object) {
		return await model.updateMany(query, {
			$set: object
		}, {
			multi: true
		});
	};
};

var destroyFunctionFactory = function(model) {

	return async function(query) {
		return await model.deleteMany(query);
	};
};

let closeConnectionFunctionFactory = function(connection) {
	return async function() {
		if (!connection || !connection.db) {
			return;
		}
		try {
			await connection.db.removeAllListeners();
			await connection.db.close();
		} catch (err) {
			console.log(err);
		}
	};
};

dbManager.getModels = async function(connection) {
	connection.models = {};
	for (let key of Object.keys(Schemas)) {
		connection.models[key + "s"] = await connection.db.model(key, Schemas[key]);
		connection.models[key + "s"].create = createFunctionFactory(connection.models[key + "s"]);
		connection.models[key + "s"].select = selectFunctionFactory(connection.models[key + "s"]);
		connection.models[key + "s"].modify = modifyFunctionFactory(connection.models[key + "s"]);
		connection.models[key + "s"].destroy = destroyFunctionFactory(connection.models[key + "s"]);
	}
};

dbManager.connect = async function() {
	let connection = {};
	connection.db = await mongoose.createConnection(dbManager.databaseURL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true
	});
	connection.db.on('error', console.error.bind(console, 'MongoDB error:'));
	await dbManager.getModels(connection);
	connection.closeConnection = closeConnectionFunctionFactory(connection);
	return connection;
};

dbManager.init = async function() {
	try {
		let connection = await dbManager.connect();
		await connection.closeConnection();
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
		dbManager.close();
	}
*/