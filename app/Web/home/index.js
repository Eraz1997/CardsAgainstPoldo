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
		$scope.players = [
		];
		$scope.playerJoined = false;
		$scope.nickBoxDisabled = false;

		async function polling() {
			let getUsers = await $http.get("/api/users");
			if (getUsers.status == 200) {
				$scope.playerErr = "";
				let users = getUsers.data.users;
				for (let i = 0; i < users.length; i++) {
					$scope.players[i] = users[i][0];
					if (users[i][1] == true){
						$scope.master = users[i][0];
					}
				}
			}
			else {
				$scope.playersErr = getUsers.data.error;
			}
			if ($scope.playerJoined == true) {
				let getGameStarted = await $http.get("/api/gameStarted");
				if (getGameStarted.status == 200) {
					if (getGameStarted.data.started == true) {
						$window.location.replace("/game!#?nickname="+$scope.nickname);
					}
				}
				else {
					$scope.playersErr = getGameStarted.data.error;
				}
			}
		}
		$interval(polling(), 500);

		$scope.enterButton_onClick = async function() {
			// controlla se il nick è stato inserito e se non è troppo lungo
			if (!$scope.nickInputForm.$valid) {
				if ($scope.nickInputForm.$error.required) {
					$scope.nickErr = "Inserisci un nickname maledetto autista";
				}
				else if($scope.nickInputForm.textbox.$error.maxlength !== undefined) {
					$scope.nickErr = "È troppo lungo";
				}
				else {
					console.log($scope.nickInputForm.$error);
				}
			}
			else {
				$scope.nickBoxDisabled = true;
				let postUser = await $http.post("/api/user", $scope.nickname); //invia nuovo nome utente
				if (postUser.status == 200) {
					$scope.nickErr = "";
					$scope.playerJoined = true;
				}
				else { //se ci sono problemi nella post (nick già in uso ad es.) rimane tutto così e mostra errore
					$scope.nickErr = postUser.data.error;
					$scope.nickBoxDisabled = false;
				}
			}
		};

		$scope.exitButton_onClick = async function() {
			let deleteUser = await $http.delete("/api/user", $scope.nickname);
			if (deleteUser.status == 200) {
				$scope.nickErr = "";
				$scope.playerJoined = false;
				$scope.nickBoxDisabled = false;
			}
			else {
				$scope.nickErr = deleteUser.data.error;
			}
		};

		$scope.startButton_onClick = async function() {
			let postGame = await $http.post("/api/game", $scope.nickname);
			if (postGame.status == 200) {
				$window.location.replace("/game!#?nickname="+$scope.nickname);
			}
			else {
				$scope.nickErr = postGame.data.error;
			}
		};
	});
