"use strict";
angular.module("app.home", ["ngCookies", "ngWebsocket"])
	.controller("homeController", function($scope, $timeout, $http, $location, $interval, $cookies, $websocket) {

		// un sottotitolo è scelto a caso tra quelli nel seguente array
		let subtitleArray = [
			"Il risultato del non avere davvero un cazzo da fare",
			"Luca o m o s e s s u a l e",
			"HAI SUPPOSTO!",
			"GUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU",
			"Le brutte intenzioni, la maleducazione, la tua brutta figura di ieri sera, la tua ingratitudine, la tua arroganza, fai ciò che vuoi mettendo i piedi in testa. Certo il disordine è una forma d’arte, ma tu sai solo coltivare invidia. Ringrazia il cielo sei su questo palco, rispetta chi ti ci ha portato dentro. Ma questo sono io.",
			"Il rock è la musica migliore del mondo",
			"Mi sento mancare",
			"Puledri!",
			"Comunque meno buggato dei giochi di Alessio",
			"Ooof",
			"Scandalo della ragione",
			"Ci son cascato di nuovo"
		];
		$scope.subtitle = subtitleArray[Math.floor(Math.random() * subtitleArray.length)];

		$scope.nickErr = "";
		$scope.playersErr = "";
		$scope.nickname = $cookies.get("nickname");
		if ($scope.nickname) {
			$scope.nicknameFromCookie = true;
		}
		//if($scope.nickname) {...}
		$scope.master = null;
		$scope.players = [];
		$scope.playerJoined = false;
		$scope.nickInputDisabled = false;

		let ws = $websocket.$new("ws://localhost:3500", "cap-protocol");
		ws.$on("$open", function() {
				ws.$emit("userJoined");
				ws.$emit("gameStarted");
			})
			.$on("userJoined", function() {
				polling();
			})
			.$on("gameStarted", function() {
				if ($scope.playerJoined) {
					ws.$emit("~userJoined");
					ws.$emit("~gameStarted");
					$location.path("/game");
					$scope.$apply();
				}
			});

		async function polling() {
			try {
				$scope.gameEnded = (await $http.get("/api/gameEnded")).data.ended;
				let getUsers = await $http.get("/api/users");
				$scope.playerErr = "";
				$scope.players = getUsers.data.users.map(function(user) {
					return user.nickname;
				});
				$scope.master = getUsers.data.users.filter(function(user) {
					return user.isMaster;
				})[0];
				$scope.master = $scope.master ? $scope.master.nickname : "";
				if (!$scope.players.includes($scope.nickname)) {
					$scope.playerJoined = false;
					$scope.nickInputDisabled = false;
					if ($scope.nicknameFromCookie) {
						$scope.nicknameFromCookie = false;
						$cookies.remove("nickname");
					}
				} else {
					$scope.playerJoined = true;
					$scope.nickInputDisabled = true;
				}
			} catch (err) {
				if (err.status !== -1) {
					console.log(err);
					$scope.playersErr = err.data ? err.data.error : "";
				}
			}

			if ($scope.playerJoined) {
				try {
					let getGameStarted = await $http.get("/api/gameStarted");
					let getGameEnded = await $http.get("/api/gameEnded");
					if (getGameStarted.data.started && !getGameEnded.data.ended) {
						$location.path("/game");
						ws.$emit("~userJoined");
						ws.$emit("~gameStarted");
					}
				} catch (err) {
					console.log(err);
					$scope.playersErr = err.data.error;
				}
			}
			$scope.$apply();
		}
		polling();

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
				$scope.nickInputDisabled = true;
				try {
					await $http.post("/api/user", {
						userNickname: $scope.nickname
					}); //invia nuovo nome utente
					$scope.nickErr = "";
					$scope.playerJoined = true;
					$cookies.put("nickname", $scope.nickname);
				} catch (err) { //se ci sono problemi nella post (nick già in uso ad es.) rimane tutto così e mostra errore
					console.log(err);
					$scope.nickErr = err.data.error;
					$scope.nickInputDisabled = false;
				}
			}
			$scope.$digest();
		};

		$scope.exitButton_onClick = async function() {
			try {
				await $http.delete("/api/user?userNickname=" + $scope.nickname);
				$scope.nickErr = "";
				$scope.playerJoined = false;
				$scope.nickInputDisabled = false;
				$cookies.remove("nickname");
			} catch (err) {
				console.log(err);
				$scope.nickErr = err.data.error;
			}
		};

		$scope.startButton_onClick = async function() {
			try {
				await $http.post("/api/game", {
					userNickname: $scope.nickname
				});
			} catch (err) {
				console.log(err);
				$scope.nickErr = err.data.error;
			}
		};

		$scope.removeButton_onClick = async function(player) {
			try {
				await $http.delete("/api/user?userNickname=" + player);
				$scope.nickErr = "";
			} catch (err) {
				console.log(err);
				$scope.nickErr = err.data.error;
			}
		};

		$scope.changeRoute = function(route) {
			$location.path(route);
		};

	});