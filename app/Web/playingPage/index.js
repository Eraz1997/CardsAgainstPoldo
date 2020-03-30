"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $http, $location, $window, $timeout) {

		let init = async function() {
			// set player
			$scope.player = {
				nickname: $location.search().nickname
			};

			//check game started
			try {
				$scope.gameStarted = (await $http.get("/api/gameStarted")).data.started;
			} catch (err) {
				$window.alert(err.data.error);
			}
			if (!$scope.gameStarted) {
				$scope.$digest();
				return;
			}

			// get black card
			try {
				let player = (await $http.get("/api/user?userNickname=" + $scope.player.nickname)).data;
				$scope.blackCard = (await $http.get("/api/blackCard")).data;
				player.cards = [];
				if (!player.isMaster) {
					player.cards = (await $http.get("/api/cards?userNickname=" + player.nickname)).data;
				}
				$scope.player = player;

			} catch (err) {
				$window.alert(err.data.error);
			}
			$scope.watchingTurnWinner = false;
			$scope.watchingPlayerResponses = false;
			$scope.player.response = [];
			$scope.$digest();
		};

		await init();

		$scope.leaveGame = async function() {
			try {
				await $http.delete("/api/user?userNickname=" + $scope.player.nickname);
				$window.location.replace("/home");
			} catch (err) {
				$window.alert(err.data.error);
			}
		};

		$scope.changeCurrentResponse = async function(index) {

		};

		let startCheckingTurnWinner = async function() {

			try {
				// finché non cambia la carta, non è cambiato il turno
				let newCard = (await $http.get("/api/blackCard")).data;
				if (newCard === $scope.blackCard) {
					$timeout(startCheckingTurnWinner, 1000);
				} else {
					$scope.blackCard = newCard;
					$scope.turnWinnerCard = (await $http.get("/api/turnWinner")).data;
					let index = 0;
					$scope.turnWinnerCard.fullText = $scope.blackCard.text.split("_").map(function(item) {
						if (index >= $scope.turnWinnerCard.winnerCards.length) {
							return item;
						}
						index += 1;
						return item + " " + $scope.turnWinnerCard.winnerCards[index - 1].text + " ";
					}).join("");
					$scope.watchingTurnWinner = true;
				}
			} catch (err) {
				$window.alert(err.data.error);
			}
			$scope.$digest();
		};

		$scope.chooseResponse = async function(card) {
			$scope.player.response.push(card);
			$scope.player.cards.filter(function(c) {
				return card.uuid !== c.uuid;
			});
			if ($scope.player.response.length === $scope.blackCard.split("_").length - 1) {
				try {
					await $http.post("/api/response", {
						userNickname: $scope.player.nickname,
						cards: $scope.player.response
					});
					$scope.player.response = [];
					startCheckingTurnWinner();
				} catch (err) {
					$window.alert(err.data.error);
				}
			}

		};

		$scope.confirmBestResponse = async function() {

		};

		$scope.nextTurn = async function() {

		};
	});