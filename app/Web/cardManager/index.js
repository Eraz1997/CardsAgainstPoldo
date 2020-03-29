"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $http, $window) {

		let getCards = async function() {
			try {
				let cards = await $http.get("/api/deck");
				$scope.whiteDeck = cards.data.whiteDeck;
				$scope.blackDeck = cards.data.blackDeck;
				$scope.$digest();
			} catch (err) {
				$window.alert(err.data.error);
			}
		};

		await getCards();

		let sendCard = async function(card) {
			if (!card.text || card.text === "") {
				$window.alert("Inserisci del testo!");
			}
			try {
				await $http.post("/api/card", card);
				await getCards();
			} catch (err) {
				$window.alert(err.data.error);
			}
		};

		$scope.sendWhite = async function() {
			let card = {
				text: $scope.whiteText,
				isBlack: false
			};
			$scope.whiteText = "";
			await sendCard(card);
		};

		$scope.sendBlack = async function() {
			let card = {
				text: $scope.blackText,
				isBlack: true
			};
			$scope.blackText = "";
			await sendCard(card);
		};


		$scope.deleteCard = async function(card) {
			try {
				await $http.delete("/api/card/?uuid=" + card.uuid);
				await getCards();
			} catch (err) {
				$window.alert(err.data.error);
			}
		};

	});