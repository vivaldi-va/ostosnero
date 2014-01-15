mod.controller('RegisterCtrl', function ($scope, $http, $q, $accountsService) {



    //console.log(email);
    console.log($scope.signupForm);

	$scope.loading = false;

    function _signup(email, username, pass) {
        var dfd = $q.defer();

        $http({
            url: '../../api/register/',
            method: 'GET',
            params: {email: email, name: username, pass: pass}
        })
            .success(function (data) {
                console.log(data);
                dfd.resolve(data);
            })
            .error(function (msg) {
                console.log(msg);
                dfd.reject(msg);
            });

        return dfd.promise;
    }


    $scope.hideError = function () {
        $scope.signupForm.$error.message = null;
    };
    /*
     if (pass.length > 0 && pass.length < 6) {
     $scope.passInput.error = true;
     } else {
     $scope.passInput.error = false;
     }*/


    $scope.submit = function () {
        var email = $scope.registerEmail,
            username = $scope.registerUser,
            pass = $scope.registerPass,
            formLogin;
		$scope.loading = true;

        console.log($scope.signupForm);

        $scope.signupForm.$setDirty();

        if (!email || email.length === 0) {
            $scope.signupForm.$error.message = "Sähkopostiosoite puuttuu";

        }
        else if (!username || username.length === 0) {
            $scope.signupForm.$error.message = "no username entered";
        }
        else if (!pass || pass.length === 0) {
            $scope.signupForm.$error.message = "no password entered";
        } else {


            formLogin = _signup(email, username, pass);




        formLogin.then(function (status) {
				$scope.loading = false;
                $accountsService.login(email, pass).then(function() {
                    location.reload();
                });
            },
            function (reason) {
				$scope.loading = false;
                $scope.signupForm.$error.message = reason;

            });
        }

		if(!!$scope.signupForm.$error.message) {
			$scope.loading = false;
		}
    };
});