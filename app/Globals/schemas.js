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
	cards: [Number],
	points: Number,
	isMaster: Boolean
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
	whiteDeck: [Number],
	blackDeck: [Number],
	isStarted: Boolean
});

module.exports = Schemas;