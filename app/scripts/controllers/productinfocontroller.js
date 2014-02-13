mod.controller('ProductPageCtrl', function ($scope, $rootScope, $http, $q, $routeParams, $log, ProductService, storage, sync, spinner, listService, locationService, scroller) {
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

	$scope.errors = [];

	$scope.$on('$viewContentLoaded', function () {
		NProgress.start();
	});

	var list,
		listItemID,
		product,
		quantity;

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

	var latitude,
		longitude,
		productID;


	locationService.getCurrentLocation()
		.then(function (coords) {
			console.log($routeParams);
			NProgress.inc();
			latitude = coords.coords.latitude;
			longitude = coords.coords.longitude;
			if (!!product && !!product.product_id) {
				productID = product.product_id;
			} else {
				productID = $routeParams.productID
			}

			//spinner.init(document.getElementById('local-prices'), true);


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

		},
		function (reason) {
			NProgress.done();
			if (!!reason.code) {
				switch (reason.code) {
					case 1:
						$scope.errors.push("Could not get location. \nOstosnero doesn't have permission to get location");
						break;
					case 2:
						$scope.errors.push("Could not find location");
						break;
					case 3:
						$scope.errors.push("Took too long finding your location");
						break;
				}

			}

			//$rootScope.appError = "Can not get location: " +  reason.message;
			console.warn(reason);
		});


	/*$scope.back = function ()
	 {
	 console.log('back');
	 history.back();

	 };*/

	function setQuantityStuff() {
		//lists.lists[listID].products[listItemID].quantity = quantity;
		lists.products[listItemID].quantity = quantity;
		console.log(lists.products[listItemID].quantity);
		$scope.productInfo = lists.products[listItemID];
		storage.set('userLists', lists);
		console.log($scope.productInfo.quantity);
	}


	$scope.increase = function () {
		quantity += 1;
		console.log(quantity);
		setQuantityStuff();
	};
	$scope.decrease = function () {
		quantity -= 1;
		console.log(quantity);
		setQuantityStuff();
	};

	$scope.addProduct = function () {
		var button = $('#prodInfoAddBtn'),
			list = listService.data,
			productID = $routeParams.productID;
		$scope.isAddingProduct = true;
		listService.add(list.attributes.id, productID).then(
			function (status) {
				$scope.isAddingProduct = false;
				console.log(status);
			},
			function (reason) {
				$scope.isAddingProduct = false;

				console.warn(reason);
			}
		);
	};


	$scope.updatePrice = function (price) {
		price.waiting = true;
		ProductService.updatePrice(product.product_id, price.shop_id, price.price)
			.then(function (status) {
				price.updated = true;
				price.waiting = false;
			},
			function (reason) {
				$log.warn('ERR:', "Updating product price failed", reason);
			}
		);
	};
	var syncTimer,
		syncTimeout = 2000;

	// TODO: remove the jquery
	$('.change-quant').bind('touchend mouseup', function (e) {
		console.log('end');
		syncTimer = setTimeout(syncData, 2000);
		console.log(syncTimer);
	});

	$('.change-quant').bind('touchstart mousedown', function (e) {
		console.log('start');
		clearTimeout(syncTimer);
	});

	function syncData() {
		quantity = lists.products[listItemID].quantity;
		console.log(quantity);
		console.log(listItemID);

		sync.quantity(listItemID, quantity);
	}


});