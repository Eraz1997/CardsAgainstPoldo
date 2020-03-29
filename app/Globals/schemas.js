"use strict";
const mongoose = require("mongoose");
let Schema = mongoose.Schema;

let Schemas = {};

Schemas.user = new Schema({
	nickname: {
		type: String,
		required: true,
		index: {
			unique: true
		}
	},
	cards: [String],
	points: Number,
	isMaster: Boolean,
	response: [String]
});

Schemas.card = new Schema({
	text: {
		type: String,
		required: true
	},
	uuid: {
		type: String,
		required: true,
		index: {
			unique: true
		}
	},
	isBlack: Boolean
});

Schemas.game = new Schema({
	whiteDeck: [String],
	blackDeck: [String],
	isStarted: Boolean,
	isEnded: Boolean,
	turnWinner: String,
	turnWinnerCards: [String],
	currentBlackCard: String
});

module.exports = Schemas;