/**
 * controller for handling the user lists and related processes
 */
angular.module('App.Controllers').controller('ListCtrl', function ($q, $http, $rootScope, $scope, $location, storage, listService, scroller, sync) {

	$scope.location = $location.url();
	$scope.errors 		= [];
	$scope.successes 	= [];

	NProgress.start();

	listService.getList()
		.then(
			function (status) {
				NProgress.done();
				$scope.refreshing = false;
			},
			function(reason) {
				NProgress.done();
				console.log("couldnt get list: " + reason);
			});


	$scope.getLists = function () {
		NProgress.start();
		/*
		 * once the data has been set, construct the
		 * list scroller using FT Scroller
		 *
		 * Must be done after the ng-repeat because ng-repeat
		 * cant add elements to the ft-scroller's generated elements.
		 */



		/**
		 * function to retrieve the user's shopping lists from the server and then
		 * store them in local storage for future use.
		 *
		 * @returns deferred promise: data retrieved from getUserList API call.
		 */

		/*

		 }*/
		scroller.construct(document.getElementById('list-container'));
		$scope.refreshing = true;
		listService.getList()
			.then(
			function (status) {
				NProgress.done();
				$scope.refreshing = false;
			},
			function(reason) {
				NProgress.done();
				console.log("couldnt get list: " + reason);
			});
	};

	$scope.showMenu = function (listElem) {
		console.log(listElem);

		if ($scope.openItem == null) {
			$scope.openItem = listElem;
		} else {
			$scope.openItem = null;
		}
	};


	function addQuant(listItemId, quantDefer) {
		console.log('add quant');
		var dfd = $q.defer(),
			quantity = parseInt(listService.data.products[listItemId].quantity);

		quantity += quantDefer;
		console.log(quantity);
		listService.data.products[listItemId].quantity = quantity;
		storage.set('userLists', listService.data);
		sync.quantity(listItemId, quantity);
	}

	$('#list-container').on('click', '.list-item-menu .add, .list-item-menu .remove', function (e) {
		e.preventDefault();
		console.log('clicking da add/remove button');
	});
	$('#list-container').on('click', '.list-item-menu .add', function (e) {
		console.log('clicking da add button');
		var listItemId;

		listItemId = $(this).parent().data('id');
		console.log(listItemId);
		console.log(listService.data);
		addQuant(listItemId, 1);

	});
	$('#list-container').on('click', '.list-item-menu .remove', function (e) {
		console.log('clicking da remove button');
		var listItemId;

		listItemId = $(this).parent().data('id');
		console.log(listItemId);
		console.log(listService.data);
		addQuant(listItemId, -1);

	});

	$scope.productInfo = function (listItemID) {
		$location.url('/list/' + listItemID);
	};


	/**
	 * Remove the list item from the list.
	 * First remove it locally from the list global variable
	 * followed by the localstorage.
	 *
	 * After which send an asynchronous call to the API to remove
	 * the list item from the active list.
	 *
	 * @param listItemId: Row ID of the list item to be removed.
	 * @param element: the reference to the element from ng-repeat.
	 */
	$scope.removeFromList = function (listItemId, element) {
		delete $rootScope.list.products[listItemId];

		listService.removeFromList(listItemId)
			.then(function() {
				$scope.getLists();
			});
	};

	$scope.sort = function () {
		$location.url('/sort');
	};

});