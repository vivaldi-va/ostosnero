mod.controller('SearchCtrl', function ($rootScope, $scope, $route, ProductService, scroller, listService, storage) {


    $scope.page = {
        title: "Product Search"
    };



	$scope.$on('$routeChangeSuccess', function(e, curr, prev) {
		if (!!prev && prev.controller === 'ProductPageCtrl') {
			repopulateSearchResults();
		}
	});

    //$('#product-search-results').height($(window).innerHeight() - 180);
    var searchSendTimer;
    $('#product-search-input').bind('keyup', function () {
        console.log("send stuff");
        searchSendTimer = setTimeout(fetchResults, 1000);
    });
    $('#product-search-input').bind('keydown', function () {
        console.log("stop sending stuff");
        $scope.status = 'fetching';
        clearTimeout(searchSendTimer);
    });

	function repopulateSearchResults() {
		if(!!localStorage.searchResults) {
			$scope.results = JSON.parse(localStorage.searchResults);
		}
	}

    $scope.addToList = function (productId, resultElement) {
		resultElement.busy = true;

        listService.addToList(productId)
            .then(
                function (status) {
					resultElement.busy = false;
					$scope.success = resultElement;
                },
                function (reason) {
					resultElement.busy = false;
                }
            );
    };


    function fetchResults() {
		NProgress.start();
        if ($scope.searchTerm.length >= 3) {
			ProductService.getSearchResults($scope.searchTerm)
				.then(function (results) {
					NProgress.done();
                    $scope.status = 'found';
                    storage.add('searchResults', results);
                    console.log("found you some results");
                    $scope.results = results;
                    scroller.construct(document.getElementById('product-search-results'));
                },
                function (reason) {
					NProgress.done();
                    console.log("something went wrong: " + reason);
                });
        }
    }




});