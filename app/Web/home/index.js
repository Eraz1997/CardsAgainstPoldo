"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $timeout, $http, $window, $interval) {

		// un sottotitolo è scelto a caso tra quelli nel seguente array
		let subtitleArray = [
			"Il risultato del non avere davvero un cazzo da fare",
			"Luca o m o s e s s u a l e",
			"HAI SUPPOSTO!",
			"GUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU",
			"Dov'è Bugo?",
			"Il rock è la musica migliore del mondo",
			"Mi sento mancare",
			"Puledri!",
			"Ooof"
		];
		$scope.subtitle = subtitleArray[Math.floor(Math.random() * subtitleArray.length)];

		$scope.nickErr = "";
		$scope.playersErr = "";
		$scope.nickname = "";
		$scope.master = null;
		$scope.players = [];
		$scope.playerJoined = false;
		$scope.nickBoxDisabled = false;

		async function polling() {
			try {
				let getUsers = await $http.get("/api/users");
				$scope.playerErr = "";
				let users = getUsers.data.users;
				for (let i = 0; i < users.length; i++) {
					$scope.players[i] = users[i][0];
					if (users[i][1] == true) {
						$scope.master = users[i][0];
					}
				}
			} catch (err) {
				$scope.playersErr = err.data.error;
			}

			if ($scope.playerJoined == true) {
				try {
					let getGameStarted = await $http.get("/api/gameStarted");
					if (getGameStarted.data.started == true) {
						$window.location.replace("/game!#?nickname=" + $scope.nickname);
					}
				} catch (err) {
					$scope.playersErr = err.data.error;
				}
			}
		}
		$interval(polling(), 500);

		$scope.enterButton_onClick = async function() {
			// controlla se il nick è stato inserito e se non è troppo lungo
			if (!$scope.nickInputForm.$valid) {
				if ($scope.nickInputForm.$error.required) {
					$scope.nickErr = "Inserisci un nickname maledetto autista";
				} else if ($scope.nickInputForm.textbox.$error.maxlength !== undefined) {
					$scope.nickErr = "È troppo lungo";
				} else {
					console.log($scope.nickInputForm.$error);
				}
			} else {
				$scope.nickBoxDisabled = true;
				try {
					await $http.post("/api/user", $scope.nickname); //invia nuovo nome utente
					$scope.nickErr = "";
					$scope.playerJoined = true;
				} catch (err) { //se ci sono problemi nella post (nick già in uso ad es.) rimane tutto così e mostra errore
					$scope.nickErr = err.data.error;
					$scope.nickBoxDisabled = false;
				}
			}
		};

		$scope.exitButton_onClick = async function() {
			try {
				await $http.delete("/api/user", $scope.nickname);
				$scope.nickErr = "";
				$scope.playerJoined = false;
				$scope.nickBoxDisabled = false;
			} catch (err) {
				$scope.nickErr = err.data.error;
			}
		};

		$scope.startButton_onClick = async function() {
			try {
				await $http.post("/api/game", $scope.nickname);
				$window.location.replace("/game!#?nickname=" + $scope.nickname);
			} catch (err) {
				$scope.nickErr = err.data.error;
			}
		};
	});