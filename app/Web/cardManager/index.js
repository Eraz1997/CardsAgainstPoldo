"use strict";
angular.module("app.card", [])
	.controller("cardController", function($scope, $http, $window, $location) {

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

		getCards();

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

		$scope.sendDeck = async function(deck) {
			deck = deck.replace(/^\s*[\r\n]/gm, "\n");
			let cards = deck.match(/[^\r\n]+/g);
			if (cards != null && cards.length) {
				let blackCards = false;
				if (cards[0] === "BIANCHE" || cards[0] === "NERE") {
					for (var card of cards) {
						if (card === "BIANCHE") {
							blackCards = false;
							console.log("Sezione carte bianche");
						} else if (card === "NERE") {
							blackCards = true;
							console.log("Sezione carte nere");
						} else {
							if (blackCards && !card.includes("_")) {
								$window.alert("La seguente carta non è stata inviata poiché non contiene nessuno spazio vuoto:\n" + card);
							} else {
								await sendCard({
									text: card,
									isBlack: blackCards
								});
								console.log("Carta inviata: " + card);
							}
						}
					}
				} else {
					$window.alert("Formato deck non valido");
				}
			} else {
				$window.alert("Deck vuoto");
			}
		};
		$scope.changeRoute = function(route) {
			$location.path(route);
		};

	})

	.directive('onReadFile', function($parse) {
		return {
			restrict: 'A',
			scope: false,
			link: function(scope, element, attrs) {
				var fn = $parse(attrs.onReadFile);

				element.on('change', function(onChangeEvent) {
					var reader = new FileReader();

					reader.onload = function(onLoadEvent) {
						scope.$apply(function() {
							fn(scope, {
								$fileContent: onLoadEvent.target.result
							});
						});
					};

					reader.readAsText((onChangeEvent.srcElement || onChangeEvent.target).files[0]);
				});
			}
		};

	});