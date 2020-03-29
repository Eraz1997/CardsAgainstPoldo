"use strict";
angular.module("app", [])
	.controller("controller", async function($scope, $http, $window) {

		let getCards = async function() {
			let cards = await $http.get("/api/deck");
			$scope.whiteDeck = cards.data.whiteDeck;
			$scope.blackDeck = cards.data.blackDeck;
			$scope.$digest();
		};

		await getCards();

		let sendCard = async function(card) {
			if (!card.text || card.text === "") {
				$window.alert("Inserisci del testo!");
			}
			let response = (await $http.post("/api/card", card)).data;
			if (!response.success) {
				$window.alert(response.error);
			} else {
				await getCards();
			}
		};

		$scope.sendWhite = async function() {
			let card = {
				text: $scope.whiteText,
				isBlack: false
			};
			await sendCard(card);
		};

		$scope.sendBlack = async function() {
			let card = {
				text: $scope.blackText,
				isBlack: true
			};
			await sendCard(card);
		};


		$scope.deleteCard = async function(card) {
			let response = (await $http.delete("/api/card/?uuid=" + card.uuid)).data;
			console.log(response);
			if (!response.success) {
				$window.alert(response.error);
			} else {
				await getCards();
			}
		};

	});