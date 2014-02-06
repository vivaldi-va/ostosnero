/**
 * Created by vivaldi on 06/12/13.
 */
/**
 * service for managing lists,
 * including adding and removing products.
 *
 * @variable data: the user list in JSON format
 * @method: add: add a product to the user list
 * @method: remove: remove a product from the user list
 */
fac.factory('listService', function ($rootScope, $http, $q, $log, storage) {
	console.log('list service');

	$rootScope.list = false;

	function _getList() {
		var dfd = $q.defer();

		$http({
			url: '../../api/list',
			method: 'GET'
		})
			.success(function(data) {
				if(!data.success) {
					dfd.reject(data.error);
				}

				$rootScope.list = data.data;
				dfd.resolve(data.message);
			})
			.error(function(reason) {
				$log.warn('ERR:', "Getting list failed", reason);
				dfd.reject(reason);
			});
		return dfd.promise;
	}
/*
	function _addProduct(productId) {
		var dfd = $q.defer();
		return dfd.promise;
	}*/

	return {
		getList: _getList,
		add: function (listID, productID) {

			var dfd = $q.defer(),
				self = this,
				list = self.data;

			console.log("add product method in listService");
			console.log(listID);
			console.log(productID);
			$http({
				method: 'GET',
				url: '../../api/lists/addToUserList',
				params: {listID: list.attributes.id, productID: productID}
			})
				.success(function (data) {
					console.log(data);
					if (data.success === 1) {
						localStorage.removeItem('userLists');
						console.log(data);

						var listItemID = data.data.listItemID;

						mixpanel.track("User added a product to their list", {
							"product_id": productID,
							"list_id": listID
						});
						list.products[listItemID] = data.data;
						dfd.resolve(data);
					} else {
						dfd.reject(data);
					}
				})
				.error(function (msg) {
					console.warn('adding to list failed: \r\n' + msg);
					dfd.reject(msg);
				});

			return dfd.promise;
		},
		remove: function (listItemId) {
			$http({
				url: '../../api/lists/remove-from-list/',
				params: {listid: listItemId},
				method: 'get'
			})
				.success(function (data) {
					console.log(data);
				})
				.error(function (msg) {
					console.log(msg);
				});
		}
	};
});