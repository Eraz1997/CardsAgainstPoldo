"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $http, $location, $window) {

		let init = async function() {
			$scope.player = {
				nickname: $location.search().nickname
			};
			try {
				$scope.gameStarted = (await $http.get("/api/gameStarted")).data.started;
				$scope.$digest();
				console.log($scope.gameStarted);
			} catch (err) {
				$window.alert(err);
			}
		};

		await init();
	});