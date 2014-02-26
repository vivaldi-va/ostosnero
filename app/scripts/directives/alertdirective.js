/**
 * Created by vivaldi on 21.2.2014.
 */

angular.module('App.Directives')
	.directive('onAlert', function($timeout, $log) {

		return {
			restrict: 'EA',
			replace: true,
			template: '<div class="alert {{ error.type }}" ng-if="visible" ng-animate="\'alert\'">{{ error.message }}</div>',
			scope: {
				error: '='
			},
			link: function(scope, elem, attrs) {

				scope.visible = false;//scope.error.hasOwnProperty('message');
				$log.debug('onAlert', "alert should show?", scope.visible, scope.error);
				scope.$watch('error', function(newValue, oldValue) {

					$log.debug('onAlert', "scope watcher for scope.error", oldValue, newValue);

					if(!!newValue) {
						scope.visible = true;
						if(scope.error.type !== 'error') {
							$timeout(function(){
								//$animate.leave(elem);
								scope.visible = false;
							}, 2000);
						}
					}
				});


				/*if(scope.visible) {
					$animate.enter(elem.parent());

				}*/
			}
		}
	});