"use strict";
angular.module("app", ["ngRoute",
		"app.home",
		"app.userManager",
		"app.game",
		"app.leaderboard",
		"app.card"
	])
	.config(["$routeProvider", function($routeProvider) {

		$routeProvider.when("/", {
				templateUrl: "./app/Web/home/index.html",
				controller: "homeController"
			})
			.when("/home", {
				templateUrl: "./app/Web/home/index.html",
				controller: "homeController"
			})
			.when("/game/:nickname", {
				templateUrl: "./app/Web/playingPage/index.html",
				controller: "gameController"
			})
			.when("/cardManager", {
				templateUrl: "./app/Web/cardManager/index.html",
				controller: "cardController"
			})
			.when("/leaderboard/:nickname", {
				templateUrl: "./app/Web/leaderboard/index.html",
				controller: "leaderboardController"
			})
			.when("/userManager", {
				templateUrl: "./app/Web/userManager/index.html",
				controller: "userManagerController"
			}).otherwise({
				redirectTo: "/"
			});
	}]);