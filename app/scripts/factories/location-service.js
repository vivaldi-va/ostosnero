/**
 * Created by vivaldi on 5.12.2013.
 */

fac
	.factory('locationService', function ($q, $http, $rootScope)
	{
		return {
			init: function ()
			{

			},
			location: {
				latitude: 0,
				longitude: 0,
				string: ''
			},
			status: function ()
			{
				var enabled = false;
				if (navigator.geolocation) {
					enabled = true;
				}

				return enabled;
			},
			getCurrentLocation: function ()
			{

				/**
				 * check geolocation support
				 */
				if (navigator.geolocation) {
					var dfd = $q.defer();

					console.log('location works');

					navigator.geolocation.getCurrentPosition(
						function (position)
						{
							$rootScope.$apply(function ()
							{
								dfd.resolve(position);
							});
						},
						function (err)
						{
							$rootScope.$apply(function ()
							{
								dfd.reject(err);
							});
						},
						{timeout: '6000'}
					);
					console.log('returning location');
				} else {
					error('location services not supported, sorry');
				}
				return dfd.promise;
			},
			getAddress: function (lat, long)
			{
				var dfd = $q.defer();
				$http({
					url: '../../api/getLocationInfo/',
					method: 'get',
					params: {lat: lat, long: long}
				})
					.success(function (data)
					{
						dfd.resolve(data);
					})
					.error(function (reason)
					{
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			searchLocation: function (term)
			{
				var dfd = $q.defer();

				$http({
					url: "../../api/getSearchLocations",
					method: "GET",
					params: {term: term}
				})
					.success(function (data)
					{
						console.log(data);
						if (!!data.success) {
							mixpanel.track("Location search", {
								"term": term
							});
							dfd.resolve(data.data);
						} else {
							dfd.reject(data.error);
						}
					})
					.error(function (reason)
					{
						console.warn(reason);
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			addChosen: function (location)
			{
				var dfd = $q.defer(),
					user;


				if (!!localStorage.user) {
					user = JSON.parse(localStorage.user);
				}

				$http({
					url: '../../api/location/',
					params: {user: user.email, query: 'save', id: location.id},
					method: 'get'
				})
					.success(function (status)
					{
						if (!!status.error) {
							mixpanel.track("Add location", {
								"location_id": location.id
							});
							dfd.reject(status.error);
						} else {
							dfd.resolve();
						}
					})
					.error(function (reason)
					{
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			removeFromChosen: function (location)
			{
				var dfd = $q.defer(),
					user;


				if (!!localStorage.user) {
					user = JSON.parse(localStorage.user);
				}

				$http({
					url: '../../api/location/',
					params: {user: user.email, query: 'removesaved', id: location.id},
					method: 'get'
				})
					.success(function (status)
					{
						if (!!status.error) {
							dfd.reject(status.error);
						} else {
							dfd.resolve();
						}
					})
					.error(function (reason)
					{
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			getChosen: function() {
				var dfd = $q.defer(),
					user;


				if (!!localStorage.user) {
					user = JSON.parse(localStorage.user);
				}

				$http({
					url: '../../api/location/',
					params: {user: user.email, query: 'get'},
					method: 'get'
				})
					.success(function (data)
					{
						if (!!data.error) {
							dfd.reject(data.error);
						} else {
							dfd.resolve(data.data);
						}
					})
					.error(function (reason)
					{
						dfd.reject(reason);
					});

				return dfd.promise;
			},
			favoriteLocation: function (location)
			{

			}
		};
	})
