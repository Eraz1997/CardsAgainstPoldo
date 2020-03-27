"use strict";
module.exports = function(request, response) {
	response.status(200).send({
		message: "Hello World!"
	});
};