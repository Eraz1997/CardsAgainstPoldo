"use strict";
angular.module('app', [])
	.controller('controller', function($scope) {
		// Initialize variables
		$scope.name1 = '';
		this.name2 = '';

		$scope.greeting1 = `Hello ${$scope.name1}`;
		this.greeting2 = `Hi ${this.name2}`;
	});