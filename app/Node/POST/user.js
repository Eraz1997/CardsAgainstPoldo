"use strict";
const dbManager = require("../../Globals/dbManager.js");

module.exports = async function(request, response) {
	let connection;

	try {
		let nick = request.body.userNickname;
		let cards = [];
		let isMaster = false;

		if (!nick || nick === "") {
			throw "Nickname non inserito";
		}
		connection = await dbManager.connect();

		//await connection.models.users.destroy({}); //PER RIPULIRE IL DATABASE IN FASE DI TEST
		let existingUser = await connection.models.users.select({
			nickname: nick
		});
		if (existingUser.length) {
			throw "Nickname già usato";
		}
		let checkMaster = await connection.models.users.select({}, ["nickname"]);
		if (checkMaster.length === 0) {
			isMaster = true;
		}

		let games = await connection.models.users.select({}, ["isEnded"]);
		if (games.length && games[0].isEnded) {
			throw "Aspetta che la partita precedente venga chiusa";
		}

		if (isMaster) {
			let whiteDeck = (await connection.models.cards.select({
				isBlack: false
			})).map(function(item) {
				return item.uuid;
			});
			let blackDeck = (await connection.models.cards.select({
				isBlack: true
			})).map(function(item) {
				return item.uuid;
			});
			whiteDeck.sort(function() {
				return 0.5 - Math.random();
			});
			blackDeck.sort(function() {
				return 0.5 - Math.random();
			});
			if (!blackDeck.length) {
				throw "Carte nere non sufficienti per iniziare una partita";
			}
			if (whiteDeck.length < 10) {
				throw "Carte bianche non sufficienti per inserirti nella partita";
			}
			let currentBlackCard = blackDeck[0];
			blackDeck.shift();
			cards = whiteDeck.splice(0, 10);
			//console.log(cards);
			await connection.models.games.destroy({});
			await connection.models.games.create({
				whiteDeck: whiteDeck,
				blackDeck: blackDeck,
				isStarted: false,
				isEnded: false,
				turnWinner: null,
				turnWinnerCards: null,
				currentBlackCard: currentBlackCard,
				turn: 0
			});
		} else {
			let games = await connection.models.games.select({});
			if (!games.length) {
				throw "Errore, gioco non trovato";
			}
			let whiteDeck = games[0].whiteDeck;
			cards = whiteDeck.splice(0, 10);
			await connection.models.games.modify({}, {
				whiteDeck: whiteDeck
			});
		}

		await connection.models.users.create({
			nickname: nick,
			cards: cards,
			points: 0,
			isMaster: isMaster,
			response: null
		});


		//console.log(await connection.models.users.select({}));
		//console.log(isMaster);
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