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
angular.module('App.Services').factory('listService', function ($rootScope, $http, $q, $log, storage) {
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

	function _addToList(productId) {
		var dfd = $q.defer();

		$http({
			url: '../../api/list/add/' + productId,
			method: 'GET'
		})
			.success(function (data) {
				if(!data.success) dfd.reject(data.error);
				mixpanel.track("User added a product to their list", {
					"product_id": productId
				});
				dfd.resolve();

			})
			.error(function (msg) {
				$log.warn('ERR:', 'adding to list failed', msg);
				dfd.reject(msg);
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
		addToList: _addToList,
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