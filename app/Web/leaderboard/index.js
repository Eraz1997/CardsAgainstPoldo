"use strict";
angular.module("app.leaderboard", [])
	.controller("leaderboardController", function($scope, $timeout, $http, $window, $location) {

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

		$scope.nickname = $location.search().nickname;
		getWinner();

		let getOtherPlayers = async function() {
			try {
				let allPlayers = await $http.get("/api/winner");

				console.log(allPlayers);
				$scope.otherPlayers = allPlayers.data.scoreboard.map(function(user) {
					return {
						nickname: user.nickname,
						points: user.points
					};
				});
				$scope.$digest();
			} catch (err) {
				$window.alert(err.data.error);
			}
		};

		$scope.goHome = async function() {
			try {
				await $http.delete("/api/user?userNickname=" + $scope.nickname);
				$location.path("/home");
			} catch (err) {
				console.log(err);
				$window.alert(err.data.err);
			}
		};

		getOtherPlayers();

	});