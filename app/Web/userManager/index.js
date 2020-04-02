"use strict";
angular.module("app.userManager", [])
	.controller("userManagerController", function($scope, $timeout, $http, $window, $interval) {

		$scope.nickErr = "";
		$scope.playersErr = "";
		$scope.nickname = "";
		$scope.master = null;
		$scope.players = [];
		$scope.playerJoined = false;
		$scope.nickInputDisabled = false;

		async function polling() {
			try {
				let getUsers = await $http.get("/api/users");
				$scope.playerErr = "";
				$scope.players = getUsers.data.users.map(function(user) {
					return user.nickname;
				});
				$scope.master = $scope.players.length ? getUsers.data.users.filter(function(user) {
					return user.isMaster;
				})[0].nickname : "";
			} catch (err) {
				if (err.status !== -1) {
					console.log(err);
					$scope.playersErr = err.data.error;
				}
			}
		}
		polling();
		$interval(polling, 1000);

		$scope.removeButton_onClick = async function(player) {
			try {
				await $http.delete("/api/user?userNickname=" + player);
				$scope.nickErr = "";
			} catch (err) {
				console.log(err);
				$scope.nickErr = err.data.error;
			}
		};

		$scope.forceCloseGame = async function() {
			try {
				await $http.delete("/api/forceGame");
			} catch (err) {
				console.log(err);
				$window.alert(err.data.error);
			}
		};

	});