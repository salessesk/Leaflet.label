(function (factory, window) {


	// attach your plugin to the global 'L' variable
	if (typeof window !== 'undefined' && window.L) {
		window.LeafletLabel = factory(L, require('poly2tri'));
	}
	// define an AMD module that relies on 'leaflet'
	else if (typeof define === 'function' && define.amd) {
		define(['leaflet', 'poly2tri'], factory);

	// define a Common JS module that relies on 'leaflet'
	} else if (typeof exports === 'object') {
		module.exports = factory(require('leaflet'), require('poly2tri'));
	}
}(function (L, poly2tri) {
