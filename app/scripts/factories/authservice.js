/**
 * Created by vivaldi on 06/12/13.
 */
angular.module('App.Services').factory('$accountsService', function ($rootScope, $http, $q, $log) {

	$rootScope.user = false;

	function _session() {
		var dfd = $q.defer();
		$http({
			url: '../../api/user/session',
			method: 'GET'
		})
			.success(function(data) {
				if(!data.success) {
					dfd.reject(data.error);
				}

				if(!!data.data) {
					$rootScope.user = data.data;
					mixpanel.identify(data.data.email);
					mixpanel.people.set({
						"$name": data.data.name,
						"$email": data.data.email,
						"$joined": null,
						"$last_login": new Date()
					});

					mixpanel.track("User reconnected", {
						"$email": data.data.email
					});
				}


				dfd.resolve();
			})
			.error(function(reason) {
				$log.warn('ERR:', reason);
				dfd.reject(reason);
			});

		return dfd.promise;
	}


	function _login(email, pass) {
		var dfd = $q.defer();
		$http({
			method: 'POST',
			url: '../../api/user/login',
			data: {email: email, password: pass}
		})
			.success(function (data) {

				if (!data.success) {
					dfd.reject(data.error);
				}

				if(!!data.data) {

					$rootScope.user = data.data;

					mixpanel.track("User login", {
						"$email": data.data.email
					});

					mixpanel.identify(data.data.email);
					mixpanel.people.set({
						"Name": data.data.name,
						"$email": data.data.email
					});
				}

				dfd.resolve(data);

			})
			.error(function (reason) {
				$log.warn('ERR:', reason);
				dfd.reject(reason);
			});
		return dfd.promise;
	}

	function _logout() {
		$http({
			url: '../../api/user/logout',
			method: 'GET'
		});
	}

	function _signup(email, username, pass) {
		var dfd = $q.defer();

		$http({
			url: '../../api/user/register',
			method: 'POST',
			data: {email: email, name: username, password: pass}
		})
			.success(function (data) {

				if(!data.success) {
					dfd.reject(data.error);
				}

				mixpanel.track("New user registration", {
					"$email": email,
					"name": username
				});

				mixpanel.identify(email);
				mixpanel.people.set({
					"$name": username,
					"$email": email,
					"$joined": new Date(),
					"$last_login": new Date()
				});
				dfd.resolve(data);
			})
			.error(function (reason) {
				$log.warn('ERR:', reason);
				dfd.reject(reason);
			});

		return dfd.promise;
	}

	return {
		session: _session,
		login: _login,
		logout: _logout,
		signup: _signup,
		getUser: function() {
			var user = {name: 'user not found'};
			if(!!localStorage.user) {
				self.user = JSON.parse(localStorage.user);
				user = self.user;
			}
			return user;
		}
	};
})