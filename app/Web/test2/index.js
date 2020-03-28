"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $timeout, $http, $window) {
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