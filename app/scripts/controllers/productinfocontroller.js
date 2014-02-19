angular.module('App.Controllers')
	.controller('ProductPageCtrl', function ($scope, $rootScope, $http, $q, $routeParams, $log, ProductService, spinner, listService, locationService, scroller) {
	/**
	 * Url structure: /#/product/:productID/
	 *
	 * - load product info from localstorage
	 * - load price info from database asyncronously
	 * - parse list quant
	 * - parse whether it's in other lists for dropdown thing
	 *
	 * It should be assumed if the user is drilling into product info that
	 * the list would be stored in local storage.
	 * However to compensate for direct access to a product via url
	 * it should have a failsafe to load the info dynamically.
	 * Also this should happen for loading search results and so forth.
	 * maybe.
	 */

	$scope.errors 		= [];
	$scope.successes 	= [];

	$scope.$on('$viewContentLoaded', function () {
		NProgress.start();
	});

	var list,
		listItemID,
		product,
		quantity,
		latitude,
		longitude,
		productID;

	latitude 	= $rootScope.location.latitude;
	longitude 	= $rootScope.location.longitude;

	$scope.prices = false;
	$scope.isAddingProduct = false;

	/**
	 * if the product ID is in the route params, it can be assumed
	 * that the global product page is requested (probably from searching
	 * or browsing for it). In this case, load the product info asynchronously.
	 *
	 * However, if the listItemID parameter is defined instead, it
	 * should be assumed a product in a list is requested. Thus, load the info from the localStorage.
	 *
	 */
	if (!!$routeParams.productID) {

		$scope.inList = false;
		//var productData = getProductService();
		var productData = ProductService.product($routeParams.productID);

		productData.then(function (data) {
				NProgress.inc();
				console.log(data);
				$scope.productInfo = data;
			},
			function (reason) {
				console.warn(reason);
			});

	}
	else if (!!$routeParams && !!$routeParams.listItemID) {
		$scope.inList 		= true;
		listItemID 			= $routeParams.listItemID;
		list 				= $rootScope.list;
		product 			= list.products[listItemID];
		quantity 			= parseInt(product.quantity);
		$scope.productInfo 	= product;
		$log.info('DEBUG:', "product info", product);
	}

	if (!!product && !!product.product_id) {
		productID = product.product_id;
	} else {
		productID = $routeParams.productID
	}



	ProductService.getLocalPrices(productID, {lat: latitude, long: longitude})
		.then(function (prices) {
			//spinner.stop();
			NProgress.done();
			$scope.prices = [];
			console.log(prices);
			$scope.prices = prices;
			for (var p in prices) {
				$scope.placeholder = "";


				if (!prices[p].price) {
					$scope.placeholder = "no price here yet";
				}
			}
			//$scope.prices = prices;
			scroller.construct(document.getElementById('productPage'));
		},
		function (reason) {
		}
	);

	$scope.addProduct = function () {
		var productID = $routeParams.productID;
		$scope.isAddingProduct = true;
		listService.addToList(productID)
			.then(function (status) {
				$scope.isAddingProduct = false;
			},
			function (reason) {
				$scope.isAddingProduct = false;
				$log.warn("ERR:", "Adding product failed", reason);
			});
	};


	$scope.updatePrice = function (price) {
		price.waiting = true;
		ProductService.updatePrice(productID, price.shop_id, price.price)
			.then(function (status) {
				price.updated = true;
				price.waiting = false;
			},
			function (reason) {
				$log.warn('ERR:', "Updating product price failed", reason);
			}
		);
	};

	$scope.changeQuantity = function(listItemId, quantDiff) {
		$log.info('DEBUG:', "Change list item quantity", [listItemId, quantDiff]);
		var quantity;
		$rootScope.list.products[listItemId].quantity = parseInt($rootScope.list.products[listItemId].quantity) + quantDiff;
		quantity = $rootScope.list.products[listItemId].quantity;
		listService.changeQuantity(listItemId, quantity)
			.then(
			function(success) {
				$scope.successes.push("Quantity changed");
			},
			function(reason) {
				// TODO: make errors relate to reason's error message
				$log.warn('ERR: "Quantity change failed', reason);
				$scope.errors.push("Could not change quantity");
			}
		);
	};


});