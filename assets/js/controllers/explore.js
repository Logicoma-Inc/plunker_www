var defaultParams, filters, generateRouteHandler, module, resolvers;

module = angular.module("plunker.explore", ["plunker.addthis", "plunker.gallery", "plunker.pager", "plunker.overlay", "plunker.menu", "plunker.plunks", "plunker.url"]);

filters = {
  trending: {
    href: "/plunks/trending",
    text: "Trending",
    order: "a"
  },
  views: {
    href: "/plunks/views",
    text: "Most viewed",
    order: "b"
  },
  popular: {
    href: "/plunks/popular",
    text: "Most starred",
    order: "c"
  },
  recent: {
    href: "/plunks/recent",
    text: "Recent",
    order: "d"
  }
};

defaultParams = {
  pp: 12,
  files: 'yes'
};

resolvers = {
  trending: [
    "$location", "url", "plunks", function($location, url, plunks) {
      return plunks.query({
        url: url.api + "/plunks/trending",
        params: angular.extend(defaultParams, $location.search())
      }).$$refreshing;
    }
  ],
  views: [
    "$location", "url", "plunks", function($location, url, plunks) {
      return plunks.query({
        url: url.api + "/plunks/views",
        params: angular.extend(defaultParams, $location.search())
      }).$$refreshing;
    }
  ],
  popular: [
    "$location", "url", "plunks", function($location, url, plunks) {
      return plunks.query({
        url: url.api + "/plunks/popular",
        params: angular.extend(defaultParams, $location.search())
      }).$$refreshing;
    }
  ],
  recent: [
    "$location", "url", "plunks", function($location, url, plunks) {
      return plunks.query({
        url: url.api + "/plunks",
        params: angular.extend(defaultParams, $location.search())
      }).$$refreshing;
    }
  ]
};

generateRouteHandler = function(filter, options) {
  if (options == null) {
    options = {};
  }
  return angular.extend({
    templateUrl: "partials/explore.html",
    resolve: {
      filtered: resolvers[filter]
    },
    reloadOnSearch: true,
    controller: [
      "$rootScope", "$scope", "$injector", "menu", "filtered", function($rootScope, $scope, $injector, menu, filtered) {
        $rootScope.page_title = "Explore";
        $scope.plunks = filtered;
        $scope.filters = filters;
        $scope.activeFilter = filters[filter];
        if (!options.skipActivate) {
          menu.activate("plunks");
        }
        if (options.initialize) {
          return $injector.invoke(options.initialize);
        }
      }
    ]
  }, options);
};

module.config([
  "$routeProvider", function($routeProvider) {
    var initialLoad, results, view, viewDef;
    initialLoad = [
      "url", function(url) {
        if (url.carbonadsH) {
          return $script(url.carbonadsH);
        }
      }
    ];
    $routeProvider.when("/", generateRouteHandler("trending", {
      templateUrl: "partials/landing.html",
      skipActivate: true,
      initialize: initialLoad
    }));
    $routeProvider.when("/plunks", generateRouteHandler("trending"));
    results = [];
    for (view in filters) {
      viewDef = filters[view];
      results.push($routeProvider.when("/plunks/" + view, generateRouteHandler(view)));
    }
    return results;
  }
]);

module.run([
  "menu", function(menu) {
    return menu.addItem("plunks", {
      title: "Explore plunks",
      href: "/plunks",
      'class': "icon-th",
      text: "Plunks"
    });
  }
]);

module.run([
  "$templateCache", function($templateCache) {
    $templateCache.put("partials/explore.html", "<div class=\"container\">\n  <plunker-pager class=\"pull-right\" collection=\"plunks\"></plunker-pager>\n  \n  <ul class=\"nav nav-pills pull-left\">\n    <li ng-repeat=\"(name, filter) in filters | orderBy:'order'\" ng-class=\"{active: filter == activeFilter}\">\n      <a ng-href=\"{{filter.href}}\" ng-bind=\"filter.text\"></a>\n    </li>\n  </ul>\n\n  <div class=\"row\">\n    <div class=\"span12\">\n      <plunker-gallery plunks=\"plunks\"></plunker-gallery>\n    </div>\n  </div>\n\n  <plunker-pager class=\"pagination-right\" collection=\"plunks\"></plunker-pager>\n</div>");
    return $templateCache.put("partials/landing.html", "<div class=\"container plunker-landing\">\n  <div class=\"hero-unit\">\n    <h1>\n      Plunker\n      <small>Helping developers make the web</small>  \n    </h1>\n    <p class=\"description\">\n      Plunker is an online community for creating, collaborating on and sharing your web development ideas.\n    </p>\n    <p class=\"actions\">\n      <a href=\"/edit/\" class=\"btn btn-primary\">\n        <i class=\"icon-edit\"></i>\n        Launch the Editor\n      </a>\n      <a href=\"/plunks\" class=\"btn btn-success\">\n        <i class=\"icon-th\"></i>\n        Browse Plunks\n      </a>\n      <span class=\"addthis_default_style addthis_20x20_style\" addthis-toolbox addthis-description=\"Plunker is an online community for creating, collaborating on and sharing your web development ideas.\">\n        <a target=\"_self\" class=\"addthis_button_twitter\"></a>\n        <a target=\"_self\" class=\"addthis_button_facebook\"></a>\n        <a target=\"_self\" class=\"addthis_button_google_plusone_share\"></a>\n        <a target=\"_self\" class=\"addthis_button_linkedin\"></a>\n        <a target=\"_self\" class=\"addthis_button_compact\"></a>\n      </span>\n    </p>\n  </div>\n  <div class=\"row\">\n    <div class=\"span4\">\n      <h4>Design goals</h4>\n      <ul>\n        <li><strong>Speed</strong>: Despite its complexity, the Plunker editor is designed to load in under 2 seconds.</li>\n        <li><strong>Ease of use</strong>: Plunker's features should just work and not require additional explanation.</li>\n        <li><strong>Collaboration</strong>: From real-time collaboration to forking and commenting, Plunker seeks to encourage users to work together on their code.</li>\n      </ul>\n    </div>\n    <div class=\"span4\">\n      <h4>Advertisement</h4>\n      <div id=\"carbonads-container\">\n        <div class=\"carbonad\">\n          <div id=\"azcarbon\"></div>\n        </div>\n      </div>\n      <a target=\"_blank\" href=\"https://carbonads.net/dev_code.php\">Advertise here</a>\n    </div>\n    <div class=\"span4\">\n      <h4>Features</h4>\n      <ul>\n        <li>Real-time code collaboration</li>\n        <li>Fully-featured, customizable syntax editor</li>\n        <li>Live previewing of code changes</li>\n        <li>As-you-type code linting</li>\n        <li>Forking, commenting and sharing of Plunks</li>\n        <li>Fully open-source on GitHub under the MIT license</li>\n        <li>And many more to come...</li>\n      </ul>\n    </div>\n\n\n  </div>\n  \n  <div class=\"page-header\">\n    <h1>See what users have been creating</h1>\n  </div>\n  \n  <plunker-pager class=\"pull-right\" path=\"/plunks/\" collection=\"plunks\"></plunker-pager>\n  \n  <ul class=\"nav nav-pills pull-left\">\n    <li ng-repeat=\"(name, filter) in filters | orderBy:'order'\" ng-class=\"{active: filter == activeFilter}\">\n      <a ng-href=\"{{filter.href}}\" ng-bind=\"filter.text\"></a>\n    </li>\n  </ul>\n\n  <div class=\"row\">\n    <div class=\"span12\">\n      <plunker-gallery plunks=\"plunks\"></plunker-gallery>\n    </div>\n  </div>\n\n  <plunker-pager class=\"pagination-right\" path=\"/plunks/\" collection=\"plunks\"></plunker-pager>\n</div>");
  }
]);