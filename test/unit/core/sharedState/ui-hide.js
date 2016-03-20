'use strict';

describe('core', function() {
  describe('sharedState', function() {
    var scope;
    var compile;
    var SharedState;
    var $animate;

    beforeEach(function() {
      module('mobile-angular-ui.core');
      inject(function($rootScope, $compile, _$animate_, _SharedState_) {
        scope = $rootScope.$new();
        compile = $compile;
        $animate = _$animate_;
        SharedState = _SharedState_;
      });
    });

    describe('ui-hide', function() {
      it('should not set ng-hide if state is false', function() {
        spyOn($animate, 'removeClass').and.callThrough();
        SharedState.initialize(scope, 'state1', {defaultValue: false});

        var elem = compile(angular.element('<div ui-hide="state1" />'))(scope);

        scope.$digest();
        expect($animate.removeClass).toHaveBeenCalled();
        expect(elem.attr('class')).not.toContain('ng-hide');
      });

      it('should set ng-hide if state is true', function() {
        spyOn($animate, 'addClass').and.callThrough();
        spyOn($animate, 'removeClass').and.callThrough();

        SharedState.initialize(scope, 'state1', {defaultValue: true});

        var elem = angular.element('<div ui-hide="state1" />');
        var directiveElement = compile(elem)(scope);

        scope.$digest();

        expect($animate.removeClass).not.toHaveBeenCalled();
        expect($animate.addClass).toHaveBeenCalledWith(
          jasmine.anything(),
          'ng-hide', jasmine.objectContaining({
            tempClasses: 'ng-hide-animate'
          }));
        expect(directiveElement.attr('class')).toContain('ng-hide');
      });

      it('should allow interpolation', function() {
        spyOn($animate, 'removeClass').and.callThrough();

        SharedState.initialize(scope, 'state1', {defaultValue: false});

        scope.x = 1;

        var elem = compile(angular.element('<div ui-hide="state{{x}}" />'))(scope);

        scope.$digest();
        expect($animate.removeClass).toHaveBeenCalled();
        expect(elem.attr('class')).not.toContain('ng-hide');
      });
    });
  });
});
