angular.module('mobileAngularUi.capture', [])

.run([
  'Capture', 
  '$rootScope', 
  function(Capture, $rootScope) {
    $rootScope.$on('$routeChangeStart', function() {
      Capture.resetAll();
    });
  }
])

.factory('Capture', [
  '$compile', 
  function($compile) {
    var yielders = {};

    return {
      resetAll: function() {
        for (var name in yielders) {
          this.resetYielder(name);
        }
      },
      
      resetYielder: function(name) {
        var b = yielders[name];
        this.setContentFor(name, b.defaultContent, b.defaultScope);
      },

      putYielder: function(name, element, defaultScope, defaultContent) {
        var yielder = {};
        yielder.name = name;
        yielder.element = element;
        yielder.defaultContent = defaultContent || '';
        yielder.defaultScope = defaultScope;
        yielders[name] = yielder;
      },

      getYielder: function(name) {
        return yielders[name];
      },

      removeYielder: function(name) {
        delete yielders[name];
      },
      
      setContentFor: function(name, content, scope) {
        var b = yielders[name];
        if (!b) {
          return;
        }
        b.element.html(content);
        $compile(b.element.contents())(scope);
      }

    };
  }
])

.directive('contentFor', [
  'Capture', 
  function(Capture) {
    return {
      compile: function(tElem, tAttrs) {
        var rawContent = tElem.html();
        if(tAttrs.duplicate === null || tAttrs.duplicate === undefined) {
          // no need to compile anything!
          tElem.html('');
        }
        return function postLink(scope, elem, attrs) {
          Capture.setContentFor(attrs.contentFor, rawContent, scope);
          if (attrs.duplicate === null || attrs.duplicate === undefined) {
            elem.remove();
          }
        };
      }
    };
  }
])

.directive('yieldTo', [
  '$compile', 'Capture', function($compile, Capture) {
    return {
      link: function(scope, element, attr) {
        Capture.putYielder(attr.yieldTo, element, scope, element.html());
        element.contents().remove();

        scope.$on('$destroy', function(){
          Capture.removeYielder(attr.yieldTo);
        });
      }
    };
  }
]);