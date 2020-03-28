"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $timeout, $http, $window) {
		// un sottotitolo è scelto a caso tra quelli nel seguente array
		let subtitleArray = [
			"Il risultato del non avere davvero un cazzo da fare",
			"Luca Gay",
			"HAI SUPPOSTO!",
			"GUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU",
			"Dov'è Bugo?"
		];
		$scope.subtitle = subtitleArray[Math.floor(Math.random() * subtitleArray.length)];

		$scope.players = [
			"A",
			"B"
		];
		$scope.nickEntered = false;
		$scope.enterButton_onClick = async function() {
			// controllare se nick esiste già
			// se non esiste aggiungerlo
			// se tutto funziona:
			$scope.nickEntered = true;
		};

		$scope.exitButton_onClick = async function() {
			// rimuovere il propio utente
			// se sei il master assegnarlo al prossimo in lista
			$scope.nickEntered = false;
		};





		await $timeout(async function() {

		}, 1000);





		let data = await $http.get("/api/test");
		$scope.pippo = data.data;
		$scope.pluto = "PLUTO";
		$scope.$digest();

		$scope.cards = ["hitler", "gli ebrei", "santa clause", 10, "10"];

		await $timeout(async function() {
			let data = await $http.get("/api/test/?userId=1");
			$scope.pippo = data.data.nome;
		}, 1000);

		$scope.$watch("pluto", function(newValue, oldValue) {
			if (newValue != oldValue) {
				console.log("Vecchio valore " + oldValue);
				console.log("Nuovo valore " + newValue);
			}
		});

		$scope.onChange = function() {
			console.log("si");
		};

		$scope.onBlur = function() {
			$window.alert("eee");
		};

		$scope.onClick = async function() {
			let data = await $http.get("/api/test");
			$scope.pippo = data.data;
			$scope.$digest();
		};
	});
