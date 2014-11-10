(function() {
  'use strict';  
  angular.module('mobile-angular-ui.sharedState', [])

  .factory('SharedState', [
    '$rootScope',
    '$parse',
    function($rootScope, $parse){
      var values = {};    // values, context object for evals
      var statuses = {};  // status info
      var scopes = {};    // scopes references
      return {
        initialize: function(scope, id, defaultValue) {
          var isNewScope = scopes[scope] === undefined;

          scopes[scope.$id] = scopes[scope.$id] || [];
          scopes[scope.$id].push(id);

          if (!statuses[id]) {
            statuses[id] = {references: 1, defaultValue: defaultValue};
            $rootScope.$broadcast('mobile-angular-ui.state.initialized.' + id, defaultValue);
            if (defaultValue !== undefined) {
              $rootScope.$broadcast('mobile-angular-ui.state.changed.' + id, defaultValue);
            }
          } else if (isNewScope) { // is a new reference from 
                                   // a different scope
            statuses[id].references++; 
          }
          scope.$on('$destroy', function(){
            var ids = scopes[scope.$id] || [];
            for (var i = 0; i < ids.length; i++) {
              var status = statuses[ids[i]];
              status.references--;
              if (status.references <= 0) {
                delete statuses[ids[i]];
                delete values[ids[i]];
                $rootScope.$broadcast('mobile-angular-ui.state.destroyed.' + id, defaultValue);
              }
            }
            delete scopes[scope.$id];
          });
        },

        setOne: function(id, value) {
          if (statuses[id] !== undefined) {
            var prev = values[id];
            values[id] = value;
            if (prev != value) {
              $rootScope.$broadcast('mobile-angular-ui.state.changed.' + id, value, prev);
            }
            return value;
          } else {
            if (console) {
              console.warn('Warning: Attempt to set uninitialized shared state:', id);
            }
          }
        },

        setMany: function(map) {
          angular.forEach(map, function(value, id) {
            this.setOne(id, value);
          }, this);
        },

        set: function(idOrMap, value) {
          if (angular.isObject(idOrMap) && angular.isUndefined(value)) {
            this.setMany(idOrMap);
          } else {
            this.setOne(idOrMap, value);
          }
        },

        turnOn: function(id) {
          return this.setOne(id, true);     
        },

        turnOff: function(id) {
          return this.setOne(id, false);
        },

        toggle: function(id) {
          return this.setOne(id, !this.get(id));     
        },

        get: function(id) {
          return statuses[id] && values[id];
        },

        isActive: function(id) {
          return !! this.get(id);
        },

        active: function(id) {
          return this.isActive(id);
        },

        isUndefined: function(id) {
          return statuses[id] === undefined || this.get(id) === undefined;
        },

        equals: function(id, value) {
          return this.get(id) === value;
        },

        eq: function(id, value) {
          return this.equals(id, value);
        },

        values: function() {
          return values;
        }

      };
    }
  ]);
}());
