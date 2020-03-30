"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $timeout, $http, $window) {

			let getWinner = async function() {
			try {
				let allPlayers = await $http.get("/api/winner");

				$scope.winnerNick = allPlayers.data.winner.nickname;
				$scope.winnerScore = allPlayers.data.winner.points;

				$scope.$digest();
			} catch (err) {
				$window.alert(err.data.error);
			}
		};

		await getWinner();

		let getOtherPlayers = async function() {
			try {
				let allPlayers = await $http.get("/api/winner");
				
				console.log(allPlayers);
				$scope.otherPlayersNick = allPlayers.data.scoreboard.map(function(user) {
 					return user.nickname;
 				});
				$scope.otherPlayersScore = allPlayers.data.scoreboard.map(function(user) {
 					return user.points;
 				});
				$scope.$digest();
			} catch (err) {
				$window.alert(err.data.error);
			}
		};

		await getOtherPlayers();

	});
