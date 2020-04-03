"use strict";
angular.module("app.game", ["ngCookies", "ngWebsocket"])
	.controller("gameController", function($scope, $http, $location, $window, $timeout, $cookies, $websocket) {

		let ws = $websocket.$new("ws://ec2-15-188-88-135.eu-west-3.compute.amazonaws.com:3500", "cap-protocol");
		ws.$on("$open", function() {})
			.$on("turnWinner", function() {
				checkTurnWinner();
			})
			.$on("playerResponses", function() {
				checkPlayerResponses();
			});

		let applyToDom = function() {
			if (!$scope.$$phase) {
				$scope.$apply();
			}
		};

		let getFullText = function(cards) {
			let index = 0;
			let fullText = $scope.blackCard.text.split("_").map(function(item) {
				index += 1;
				if (index - 1 >= cards.length) {
					return item + "_";
				}
				return item + cards[index - 1].text;
			}).join("");
			return fullText.substring(0, fullText.length - 1);
		};

		let checkPlayerResponses = async function() {

			try {
				let responses = (await $http.get("/api/responses?userNickname=" + $scope.player.nickname)).data;
				if (responses.pendingResponses) {
					return;
				}
				responses.responses.map(function(response, index) {
					response.index = index;
					return response;
				});
				ws.$emit("~playerResponses");
				$scope.responses = responses.responses;
				if (!$scope.responses.length) {
					await $scope.leaveGame();
					return;
				}
				$scope.watchingPlayerResponses = true;
				$scope.currentResponse = $scope.responses[0];
				$scope.currentResponse.fullText = getFullText($scope.currentResponse);
			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
			applyToDom();
		};

		let checkTurnWinner = async function() {

			try {
				let gameEnded = (await $http.get("/api/gameEnded")).data.ended;
				if (gameEnded) {
					ws.$emit("~playerResponses");
					ws.$emit("~turnWinner");
					$location.path("/leaderboard");
				}
				let newWinner = (await $http.get("/api/turnWinner")).data;
				if (newWinner.turn === $scope.turn) {
					return;
				} else {
					await getGeneralInfos();
					$scope.turnWinnerCard = (await $http.get("/api/turnWinner")).data;
					$scope.turnWinnerCard.fullText = getFullText($scope.turnWinnerCard);
					$scope.watchingTurnWinner = true;
					ws.$emit("~turnWinner");
				}
			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
			applyToDom();
		};

		let getGeneralInfos = async function() {
			try {
				let gameEnded = (await $http.get("/api/gameEnded")).data.ended;
				if (gameEnded) {
					ws.$emit("~turnWinner");
					ws.$emit("~playerResponses");
					$location.path("/leaderboard");
					applyToDom();
					return;
				}
				let player = (await $http.get("/api/user?userNickname=" + $scope.player.nickname)).data;
				let blackCard = (await $http.get("/api/blackCard")).data;
				blackCard.numberOfResponses = blackCard.text.split("_").length - 1;
				$scope.blackCard = blackCard;
				$scope.turn = (await $http.get("/api/turn")).data.turn;
				player.cards = [];
				if (!player.isMaster) {
					player.cards = (await $http.get("/api/cards?userNickname=" + player.nickname)).data;
				}
				player.response = player.response ? player.response : [];
				$scope.blackCard.fullText = getFullText(player.response);
				$scope.player = player;

			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
			applyToDom();

			if ($scope.player.isMaster) {
				ws.$emit("playerResponses");
			} else if ($scope.player.response.length === $scope.blackCard.numberOfResponses) {
				ws.$emit("turnWinner");
			}
		};

		let init = async function() {
			// set player
			$scope.player = {
				nickname: $cookies.get("nickname")
			};

			//check game started
			try {
				$scope.gameStarted = (await $http.get("/api/gameStarted")).data.started;
			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
			if (!$scope.gameStarted) {
				ws.$emit("~playerResponses");
				ws.$emit("~turnWinner");
				$location.path("/home");
				applyToDom();
				return;
			}
			await getGeneralInfos();
			$scope.watchingTurnWinner = false;
			$scope.watchingPlayerResponses = false;
			applyToDom();
		};

		init();

		$scope.leaveGame = async function() {
			try {
				await $http.delete("/api/user?userNickname=" + $scope.player.nickname);
				ws.$emit("~playerResponses");
				ws.$emit("~turnWinner");
				$location.path("/home");
				$cookies.remove("nickname");
			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
			applyToDom();
		};

		$scope.endGame = async function() {
			console.log($scope.player.nickname);
			try {
				await $http.post("/api/gameEnded", {
					userNickname: $scope.player.nickname
				});
				ws.$emit("~playerResponses");
				ws.$emit("~turnWinner");
				$location.path("/leaderboard");
			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
			applyToDom();
		};

		$scope.changeCurrentResponse = async function(index) {
			if (index < 0 || index >= $scope.responses.length) {
				return;
			}
			$scope.currentResponse = $scope.responses[index];
			$scope.currentResponse.fullText = getFullText($scope.currentResponse);
			applyToDom();
		};

		$scope.chooseResponse = async function(card) {
			$scope.player.response.push(card);
			$scope.player.cards = $scope.player.cards.filter(function(c) {
				return card.uuid !== c.uuid;
			});
			$scope.blackCard.fullText = getFullText($scope.player.response);
			if ($scope.player.response.length === $scope.blackCard.numberOfResponses) {
				try {
					let gameEnded = (await $http.get("/api/gameEnded")).data.ended;
					if (gameEnded) {
						ws.$emit("~playerResponses");
						ws.$emit("~turnWinner");
						$location.path("/leaderboard");
					}
					await $http.post("/api/response", {
						userNickname: $scope.player.nickname,
						cards: $scope.player.response
					});
					ws.$emit("turnWinner");
				} catch (err) {
					console.log(err);
					$window.alert(err.data.error);
					applyToDom();
				}
			}
			applyToDom();
		};

		$scope.confirmBestResponse = async function() {
			let cardUUIDs = $scope.currentResponse.map(function(card) {
				return card.uuid;
			});
			try {
				await $http.post("/api/turnWinner", {
					userNickname: $scope.player.nickname,
					cardUUIDs: cardUUIDs
				});
				await getGeneralInfos();
				$scope.watchingPlayerResponses = false;
			} catch (err) {
				console.log(err);
				$window.alert(err.data.err);
			}
			applyToDom();
		};

		$scope.nextTurn = async function() {

		};
	});