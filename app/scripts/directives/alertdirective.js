/**
 * Created by vivaldi on 21.2.2014.
 */

angular.module('App.Directives')
	.directive('onAlert', function($timeout, $animate) {

		return {
			restrict: 'EA',
			replace: true,
			template: '<div class="alert {{ error.type }}">{{ error.message }}</div>',
			scope: {
				error: '='
			},
			link: function(scope, elem, attrs) {

				scope.visible = scope.error.hasOwnProperty('message');

				if(scope.visible) {
					$animate.enter(elem.parent());
					if(scope.error.type !== 'error') {
	                 	$timeout(function(){
							$animate.leave(elem);
						}, 2000);
					}
				}
			}
		}
	});