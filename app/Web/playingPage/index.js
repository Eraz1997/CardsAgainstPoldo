"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $http, $location, $window, $timeout) {

		let getGeneralInfos = async function() {
			try {
				let player = (await $http.get("/api/user?userNickname=" + $scope.player.nickname)).data;
				let blackCard = (await $http.get("/api/blackCard")).data;
				blackCard.numberOfResponses = blackCard.text.split("_").length - 1;
				$scope.blackCard = blackCard;
				$scope.turn = (await $http.get("/api/turn")).data.turn;
				player.cards = [];
				if (!player.isMaster) {
					player.cards = (await $http.get("/api/cards?userNickname=" + player.nickname)).data;
				}
				player.response = player.response ? player.response.map(function(card) {
					return {
						uuid: card
					};
				}) : [];
				$scope.player = player;

			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
			$scope.$digest();
		};

		let init = async function() {
			// set player
			$scope.player = {
				nickname: $location.search().nickname
			};

			//check game started
			try {
				$scope.gameStarted = (await $http.get("/api/gameStarted")).data.started;
			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
			if (!$scope.gameStarted) {
				$scope.$digest();
				return;
			}
			await getGeneralInfos();
			$scope.watchingTurnWinner = false;
			$scope.watchingPlayerResponses = false;
			$scope.$digest();
		};

		await init();

		$scope.leaveGame = async function() {
			try {
				await $http.delete("/api/user?userNickname=" + $scope.player.nickname);
				$window.location.replace("/home");
			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
		};

		$scope.changeCurrentResponse = async function(index) {

		};

		let startCheckingTurnWinner = async function() {

			try {
				// finché non cambia la carta, non è cambiato il turno
				let newWinner = (await $http.get("/api/turnWinner")).data;
				if (newWinner.turn === $scope.turn) {
					$timeout(startCheckingTurnWinner, 1000);
				} else {
					await getGeneralInfos();
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
				console.log(err);
				$window.alert(err.data.error);
			}
			$scope.$digest();
		};

		$scope.chooseResponse = async function(card) {
			$scope.player.response.push(card);
			$scope.player.cards = $scope.player.cards.filter(function(c) {
				return card.uuid !== c.uuid;
			});
			if ($scope.player.response.length === $scope.blackCard.numberOfResponses) {
				try {
					await $http.post("/api/response", {
						userNickname: $scope.player.nickname,
						cards: $scope.player.response
					});
					startCheckingTurnWinner();
				} catch (err) {
					console.log(err);
					$window.alert(err.data.error);
				}
			}
			$scope.$digest();
		};

		$scope.confirmBestResponse = async function() {

		};

		$scope.nextTurn = async function() {

		};
	});