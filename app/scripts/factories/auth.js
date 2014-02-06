/**
 * Created by vivaldi on 06/12/13.
 */
fac.factory('$accountsService', function ($rootScope, $http, $q, $log) {

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

	return {
		session: _session,
		login: function (email, pass) {
			var dfd = $q.defer();
			$http({
				method: 'POST',
				url: '../../api/login/',
				data: {email: email, password: pass}
			})
				.success(function (data) {
					console.log(data);

					/**
					 * if the 'success' json attribute is not found,
					 * it is assumed that the returned value is an sql or php error.
					 * The response to this would be to display a server error message.
					 *
					 */

					if(!data) {
						dfd.reject('login failed');
					}

					if (!!data.error) {
						dfd.reject(data.error);
					} else {
						if(!!data.user) {

							self.user = data.user;

							mixpanel.track("User login", {
								"$email": data.user.email
							});

							mixpanel.identify(data.user.email);
							mixpanel.people.set({
								"Name": data.user.name,
								"$email": data.user.email
							});


							if(!!localStorage) {
								if(!!localStorage.user) {
									localStorage.user = JSON.stringify(data.user);
								} else {
									localStorage.setItem('user', JSON.stringify(data.user));
								}
							}
						}

						dfd.resolve(data);
					}

				})
				.error(function (e) {
					console.log(e);
					dfd.reject();
				});
			return dfd.promise;
		},
		logout: {},
		signup: function (email, username, pass) {
			var dfd = $q.defer();

			$http({
				url: '../../api/register/',
				method: 'GET',
				params: {email: email, name: username, pass: pass}
			})
				.success(function (data) {
					console.log(data);

					mixpanel.track("New user registration", {
						"$email": email,
						"name": username
					});

					mixpanel.identify(data.user.email);
					mixpanel.people.set({
						"$name": username,
						"$email": email,
						"$joined": new Date(),
						"$last_login": new Date()
					});
					dfd.resolve(data);
				})
				.error(function (msg) {
					console.log(msg);
					dfd.reject(msg);
				});

			return dfd.promise;
		},
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