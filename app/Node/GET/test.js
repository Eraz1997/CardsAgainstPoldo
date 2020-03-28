"use strict";
module.exports = function(request, response) {

	let parametro = request.query.userId;
	let user = {};
	if (!parametro) {
		user = "NO";
	} else {
		user = {
			nome: "pippo"
		};
	}
	response.status(200).send(user);
};