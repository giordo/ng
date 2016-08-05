var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap'])
    .config(['$provide', Decorate])
    .controller('WelcomeController', function($scope) {
        $scope.quote = 'Welcome!';
    });

function Decorate($provide) {
    $provide.decorator('tabDirective', function($delegate) {
        var directive = $delegate[0];
        directive.templateUrl = "overrides/overrideTab.tpl.html?7";
        // g
        return $delegate;
    });
};


//esempio NESTED JSON
// http://plnkr.co/edit/oLVVX3dqvhqgPhZWPuPg?p=preview

app.factory("services", ['$http', function($http) {
  var serviceBase = 'services/'
    var obj = {};
    obj.getCustomers = function(){
        return $http.get(serviceBase + 'customers');
    }
    obj.getCustomer = function(customerID){
        return $http.get(serviceBase + 'customer?id=' + customerID);
    }

    obj.insertCustomer = function (customer) {
    return $http.post(serviceBase + 'insertCustomer', customer).then(function (results) {
        return results;
    });
	};

	obj.updateCustomer = function (id,customer) {
	    return $http.post(serviceBase + 'updateCustomer', {id:id, customer:customer}).then(function (status) {
	        return status.data;
	    });
	};

	obj.deleteCustomer = function (id) {
	    return $http.delete(serviceBase + 'deleteCustomer?id=' + id).then(function (status) {
	        return status.data;
	    });
	};

    obj.getQuotes =  function(){
        return $http.get('def.json?' + Date.now());
    }

    return obj;
}]);

app.controller('listCtrl', function ($scope, services) {
  $scope.orderByField = 'customerName';
  $scope.reverseSort = false;
    //services.getCustomers().then(function(data){
    //    $scope.customers = data.data;
    //});
});

app.controller('QuotelistCtrl', function ($scope, services) {
    $scope.orderByField = 'customerName';
    $scope.reverseSort = false;
    //services.getCustomers().then(function(data){
    //    $scope.customers = data.data;
    //});
});


app.controller('editCtrl', function ($scope, $rootScope, $location, $routeParams, services, customer) {
    var customerID = ($routeParams.customerID) ? parseInt($routeParams.customerID) : 0;
    $rootScope.title = (customerID > 0) ? 'Edit Customer' : 'Add Customer';
    $scope.buttonText = (customerID > 0) ? 'Update Customer' : 'Add New Customer';
      var original = customer.data;
      original._id = customerID;
      $scope.customer = angular.copy(original);
      $scope.customer._id = customerID;

      $scope.isClean = function() {
        return angular.equals(original, $scope.customer);
      }

      $scope.deleteCustomer = function(customer) {
        $location.path('/');
        if(confirm("Are you sure to delete customer number: "+$scope.customer._id)==true)
        services.deleteCustomer(customer.customerNumber);
      };

      $scope.saveCustomer = function(customer) {
        $location.path('/');
        if (customerID <= 0) {
            services.insertCustomer(customer);
        }
        else {
            services.updateCustomer(customerID, customer);
        }
    };
});

app.controller("aaa", function($scope){
    $scope.$watch('tab.tab_total_readable', function (newa) {
        console.log("new:" + newa);
    });
});

app.controller("TabsParentController", function ($scope, $rootScope, services, $sce) {

    services.getQuotes().then(function(data){
        data.data.tabs[0].active = true;
        $scope.quote = data.data;
    });



    $scope.toggleIco = function(ele, icostr) {
        ele[icostr] = !ele[icostr];
    };

    $scope.quote = {tabs:[]};

    $scope.addNewTab = function () {
        setAllTabsInactive();
        addTab();
    };

    var setAllTabsInactive = function() {
        angular.forEach($scope.quote.tabs, function(tab) {
            tab.active = false;
        });
    };

    var currentUID = null;

    var addTab = function() {
        if($scope.currentUID == null)
            $scope.currentUID = $scope.quote.tabs.length;

        $scope.currentUID = $scope.currentUID + 1;
        $scope.quote.tabs.push({
            title: "Tab " + $scope.currentUID,
            active: true,
            print: true,
            bp: true,
            calculate: true
        });
    };

    $scope.checkEmptyString = function(str){
        return (str.length === 0 || !str.trim())? 'senza titolo' : str.trim();
    };


});

app.directive('tabs', function(){
    return {
        require: '^tabs',
        transclude: true,
        template: '<div ng-click="$parent.setCurrentTab(index)" ng-transclude></div>',
    };
});

app.factory('TemplateService', function ($http) {
    var getTemplates = function () {
        return $http.get('data/templates.json');
    };

    return {
        getTemplates: getTemplates
    };
});

app.directive('toggleShow', [function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.addClass("hide");
            bt = angular.element('<button class="btn btn-mini">'+attrs.name+'</span>');

            bt.on('click', function(){
                element.toggleClass('show');
            });
            element.on('click', function(){
                element.toggleClass('show');
            });
            element.after(bt);
        }
    };
}]);

app.directive('customField', function ($rootScope, $compile, TemplateService) {

    var inputLabelTemplate = '<div>{{content.name}}: {{content.field_value}}</div>';

    var getTemplate = function(contentType) {
        var template = '';
        switch (contentType) {
            case 'input_label':
                template = inputLabelTemplate;
                break;
        }
        return template;
    };

    var linker = function($scope, element, attrs) {
        element.html(getTemplate($scope.content.field_type));//.show();

        $compile(element.contents())($scope);

        //console.log(element);
        switch ($scope.content.field_method){
            case 'count':
                $scope.$watch($scope.content.field_target, function(v){
                    $scope.content.field_value = v;
                });
                break;
            case 'sum':
                //http://plnkr.co/edit/evoBgCkMAIkMivE2OoM8?p=preview
                //1. add watch to each
                //$scope.$watchCollection(a,)

                //2. change
                $scope.content.field_value = 2;
                break;
        }
    };


    return {
        restrict: "E",
        link: linker,
        scope: {
            content:'='
        },
        transclude: true
    };

    /*
    var getTemplate = function (templates, fieldType) {
        var template = '';

        switch (fieldType) {
            case 'field-label':
                template = templates.field-label;
                break;
            case 'field-text':
                template = templates.field-text;
                break;
            case 'field-video':
                template = templates.field-video;
                break;
        }

        return template;
    };

    var linker = function (scope, element, attrs) {
        scope.rootDirectory = 'images/';

        TemplateService.getTemplates().then(function (response) {
            var templates = response.data;

            //element.html(getTemplate(templates, scope.content.content_type));

            //$compile(element.contents())(scope);
        });
    };

    return {
        restrict: 'E',
        link: linker,
        scope: {
            content: '='
        }
    };
    */
});

app.controller ("TabsChildController", function($scope, $log){

});


// sortable hardly copied from
// http://plnkr.co/edit/WnvZETQlxurhgcm1k6Hd?p=preview
app.directive('sortable', function() {
    return {
        controller: function($scope, $attrs) {
            var listModel = null;
            $scope.$watch($attrs.sortable, function(sortable) {
                listModel = sortable;
            });
            this.move = function(fromIndex, toIndex) {
                // http://stackoverflow.com/a/7180095/1319998
                listModel.splice(toIndex, 0, listModel.splice(fromIndex, 1)[0]);
            };
        }
    };
});

app.directive('sortableItem', function($window) {
    return {
        require: '^sortable',
        link: function(scope, element, attrs, sortableController) {
            var index = null;
            scope.$watch(attrs.sortableItem, function(newIndex) {
                index = newIndex;
            });

            attrs.$set('draggable', true);

            // Wrapped in $apply so Angular reacts to changes
            var wrappedListeners = {
                // On item being dragged
                dragstart: function(e) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.dropEffect = 'move';
                    e.dataTransfer.setData('application/json', index);
                    element.addClass('dragging');
                },
                dragend: function(e) {
                    e.stopPropagation();
                    element.removeClass('dragging');
                },

                // On item being dragged over / dropped onto
                dragenter: function(e) {
                    element.addClass('hover');
                },
                dragleave: function(e) {
                    element.removeClass('hover');
                },
                drop: function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    element.removeClass('hover');
                    var sourceIndex = e.dataTransfer.getData('application/json');
                    sortableController.move(sourceIndex, index);
                }
            };

            // For performance purposes, do not
            // call $apply for these
            var unwrappedListeners = {
                dragover: function(e) {
                    e.preventDefault();
                }
            };

            angular.forEach(wrappedListeners, function(listener, event) {
                element.on(event, wrap(listener));
            });

            angular.forEach(unwrappedListeners, function(listener, event) {
                element.on(event, listener);
            });

            function wrap(fn) {
                return function(e) {
                    scope.$apply(function() {
                        fn(e);
                    });
                };
            }
        }
    };
});


app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                title: 'quote',
                templateUrl:'partials/quote.html',
                controller: 'QuotelistCtrl'
            })
            .when('/edit-customer/:customerID', {
                title: 'Edit Customers',
                templateUrl: 'partials/edit-customer.html',
                controller: 'editCtrl',
                resolve: {
                    customer: function(services, $route){
                        var customerID = $route.current.params.customerID;
                        return services.getCustomer(customerID);
                    }
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);

app.run(['$location',  '$rootScope', function($location, $rootScope) {

    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);
