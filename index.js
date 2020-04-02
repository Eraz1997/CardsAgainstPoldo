"use strict";
angular.module("app", ["ngRoute"])
	.config(["$routeProvider", function($routeProvider) {
		console.log(WEB_PAGES);
		for (let url of Object.keys(WEB_PAGES)) {
			let page = WEB_PAGES[url];
			$routeProvider.when(CONSTANTS.WEB_PREFIX + url, {
				templateUrl: "app/Web/" + page + "/index.html"
			});
		}
	}]);