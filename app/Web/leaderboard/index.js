"use strict";
angular.module("app.leaderboard", ["ngCookies"])
	.controller("leaderboardController", function($scope, $timeout, $http, $window, $location, $cookies) {

		let getWinner = async function() {
			try {
				let allPlayers = await $http.get("/api/winner");
				await $http.delete("/api/user?userNickname=" + $scope.nickname);
				$cookies.remove("nickname");

				$scope.winnerNick = allPlayers.data.winner.nickname;
				$scope.winnerScore = allPlayers.data.winner.points;

				$scope.$digest();
			} catch (err) {
				$window.alert(err.data.error);
			}
		};

		$scope.nickname = $cookies.get("nickname");
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
			$location.path("/home");
		};

		getOtherPlayers();

	});