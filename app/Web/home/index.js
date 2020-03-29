"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $timeout, $http) {
		// un sottotitolo è scelto a caso tra quelli nel seguente array
		let subtitleArray = [
			"Il risultato del non avere davvero un cazzo da fare",
			"Luca o m o s e s s u a l e",
			"HAI SUPPOSTO!",
			"GUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU",
			"Dov'è Bugo?",
			"Il rock è la musica migliore del mondo"
		];
		$scope.subtitle = subtitleArray[Math.floor(Math.random() * subtitleArray.length)];

		$scope.nickErr = "";
		$scope.nickname = "";
		$scope.master = null;
		$scope.players = [
		];
		$scope.playerJoined = false;
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
				await $http.post("/api/user", $scope.nickname) //invia nuovo nome utente
					.then(async function onSuccess() {
						$scope.nickErr = "";
						$scope.playerJoined = true;
						$scope.players = await $http.get("/api/users")
							.then(function onSuccess() {

							},
							function onError() {

							});
					},
					function onError() { //se ci sono problemi nella post (nick già in uso ad es.) rimane tutto così e mostra errore
						$scope.nickErr = "Il nickname che hai scelto esiste già, credo, sennò boh, ci saranno problemi di connessione";
					});
			}
		};

		$scope.exitButton_onClick = async function() {
			await $http.delete("/api/user", $scope.nickname) //invia nuovo nome utente
				.then(function onSuccess() {
					//DA FARE?
					$scope.playerJoined = false;
				},
				function onError() {
					//DA FARE
				});
		};

		//DA FARE:
		//polling utenti connessi

	});
