"use strict";
module.exports = (request, response) => {
	response.status(200).send({
		message: "Hello World!"
	});
};