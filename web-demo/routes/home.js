'use strict';
/*
 * GET home page.
 */

// Class Home.
function Home() {
  // option hash values are set in the routes index.js module
  // and shared by all routing modules.
  this.options = {title: 'Default', randomQuote: false}; // Default value only.

  this.routeMe = function(req, res) {
    var fileName = req.params[0];
    res.render('home', { title: this.options.title });
    return;
  };
}

var singleton = new Home();
singleton.routeMe = singleton.routeMe.bind(singleton);
module.exports = singleton;
