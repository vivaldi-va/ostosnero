/**
 * Created by vivaldi on 06/12/13.
 */
// Teach the injector how to build a 'greeter'
	// Notice that greeter itself is dependent on '$window'
fac.factory('ProductService', function ($http, $q, $log) {
		// This is a factory function, and is responsible for
		// creating the 'greet' service.




		function _getSearchResults(term) {
				var dfd = $q.defer();
				$http({
					url: '../../api/search/' + term,
					method: 'get'
				})
					.success(function (data) {
						console.log(data);

						if(!data.success) dfd.reject(data.error);

						dfd.resolve(data.data);
						mixpanel.track("User searched for products", {
							"term": term
						});
					})
					.error(function (reason) {
						$log.warn('ERR:', "Product search failed", reason);
						dfd.reject(reason);
					});

				return dfd.promise;

		}


		return {
			listItem: function (listID, listItemID) {
				if (window.localStorage && window.localStorage.userLists) {
					var lists = JSON.parse(window.localStorage.userLists),
						product = lists.lists[listID].products[listItemID];

					if (product !== undefined) {
						return product;
					} else {
						return false;
					}

				} else {
					return false;
				}

			},
			product: function (productId) {
				var dfd = $q.defer();

				$http({
					method: 'GET',
					url: '../../api/product/' + productId
				})
					.success(function (data) {

						if(!data.success) dfd.reject(data.error);
						dfd.resolve(data.data);
					})
					.error(function (reason) {
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			getSearchResults: _getSearchResults,
			getLocalPrices: function(id, location) {
				var dfd = $q.defer();
				if(!!location.lat && !!location.long) {
					//console.o
					$http({
						url: '../../api/product/prices/' + id + '/' + location.lat + '/' + location.long,
						method: 'GET'
					})
						.success(function(data) {
							console.log(data);
							if(!data.success) {
								dfd.reject(data.error);
							}

							dfd.resolve(data.data);
						})
						.error(function(reason) {
							dfd.reject(reason);
						});

				}
				return dfd.promise;
			},
			updatePrice: function(newPrice, shop, product) {
				var dfd = $q.defer(),
					data = {
						productid: product,
						shopid: shop,
						price: newPrice
					};
				$http({
					url: '../../api/prices/set-product-price/',
					method: 'POST',
					data: data
				})
					.success(function(status) {
						console.log(status);
						if(!!status.success) {
							mixpanel.track("User updated a price", {
								"product_id": product,
								"shop_id": shop,
								"new_price": newPrice
							});
							dfd.resolve(status);
						} else {
							dfd.reject(status.error);
						}
					})
					.error(function(reason) {
						dfd.reject(reason);
					});

				return dfd.promise;
			}
		};
	});