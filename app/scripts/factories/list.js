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
fac.factory('listService', function ($rootScope, $http, $q, storage) {
	console.log('list service');
	return {
		data: {
			attributes: {
				id: null,
				name: '',
				quantity: 0,
				noList: true
			},
			products: null
		},
		populate: function() {
			var self = this,
				list = self.data;
			console.log(list);
			/* the default definition of the data variable has a noList attribute, which signifies
			 *	it is not defined by data retrieved from an AJAX call
			 */
			if (list.attributes.noList === true) {
				// if there's a list in storage, use that.
				if (storage.exists('userLists') === true) {
					var list = storage.retrieve('userLists');
					// Also populate the data var with it.
					self.data = list;
					return list;
				} else {
					/* return false to enable use of if statement in list controller
					 * to use the getNew service function instead to retrieve a new list.
					 */
					return false;
				}
			} else {
				return list;
			}
		},
		getNew: function () {
			var dfd = $q.defer(),
				self = this;
			$http({
				method: 'GET',
				url: "../../api/lists/getUserList/"
			})
				.success(function (data) {
					var listId;
					console.log(data);

					// if 'error' exists, or there's no list, there's an error *shock*
					if (!data.lists && data.error !== undefined) {
						dfd.reject(data);
					} else {
						/*
						 * select the first list if there's more than 1
						 */
						for (var list in data['lists']) {
							listId = list;
							console.log("list id: " + list);

							break;
						}


						//console.log(data.lists[listId]);
						// set the list to be the data in the first list we just found
						// that is, using it's id (array key) to get the data from the lists array
						list = data.lists[listId];


						// set the service variable to be this list data
						self.data = list;
						console.log(self.data);
						// add it to the local storage
						storage.add('userLists', list);

						// resolve the promise with said data.
						dfd.resolve(list);
					}


				})
				.error(function (e) {
					// shiiiiiiit
					console.log("bad things be happenin'");
					dfd.reject(e);
				});

			// spit back something
			return dfd.promise;
		},
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