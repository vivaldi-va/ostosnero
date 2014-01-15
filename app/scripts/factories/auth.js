/**
 * Created by vivaldi on 06/12/13.
 */
fac.factory('$accountsService', function ($rootScope, $http, $q) {
	var self = this;
	return {
		user: {},
		status: function() {
			console.log('checkLogin()');
			var dfd = $q.defer();
			console.log('checkLogin function');
			$http({
				method: 'GET',
				url: "../../api/checkLogin/"
			})

				.success(function (data) {
					console.log(data);

					if(!!data.user) {
						self.user = data.user;



						mixpanel.identify(data.user.email);
						mixpanel.people.set({
							"$name": data.user.name,
							"$email": data.user.email,
							"$joined": null,
							"$last_login": new Date()
						});

						mixpanel.track("User reconnected", {
							"$email": data.user.email
						});
					}

					/**
					 * if an attribute that would always appear in the json response
					 * is not found, assume there is a server error of some kind.
					 *
					 * In this case, set the connection error to say as much and
					 * display an error message to the user.
					 *
					 */
					if (data.logged_in === undefined) {
						dfd.reject('server errors');
						$rootScope.connError = "No connection to server could be made";
					} else {
						if(!!localStorage.user) {
							localStorage.user = JSON.stringify(data.user);
							console.log(self.user);
						} else {
							localStorage.setItem('user', JSON.stringify(data.user));
						}
						dfd.resolve(data);
					}
				})
				.error(function checkLoginError(e) {
					console.warn(e);
					console.warn('login check failed: ' + e);
					dfd.reject(e);
				});
			//console.log(dfd.promise);
			return dfd.promise;
		},
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