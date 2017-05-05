/*
	Leaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak

	https://github.com/Leaflet/Leaflet.label
	http://leafletjs.com
	https://github.com/jacobtoye
*/
(function (factory, window) {


	// attach your plugin to the global 'L' variable
	if (typeof window !== 'undefined' && window.L) {
		window.LeafletLabel = factory(L, require('@mapbox/polylabel'));
	}
	// define an AMD module that relies on 'leaflet'
	else if (typeof define === 'function' && define.amd) {
		define(['leaflet', '@mapbox/polylabel'], factory);

	// define a Common JS module that relies on 'leaflet'
	} else if (typeof exports === 'object') {
		module.exports = factory(require('leaflet'), require('@mapbox/polylabel'));
	}
}(function (L, polylabel) {
L.labelVersion = '0.2.4';


var LeafletLabel = L.Class.extend({

	includes: L.Mixin.Events,

	options: {
		className: '',
		clickable: false,
		direction: 'auto',
		noHide: false,
		offset: [0, 6], // 6 (height of the label triangle)
		opacity: 1,
		zoomAnimation: true
	},

	initialize: function (options, source) {
		L.setOptions(this, options);

		this._source = source;
		this._animated = L.Browser.any3d && this.options.zoomAnimation;
		this._isOpen = false;
	},

	onAdd: function (map) {
		this._map = map;

		this._pane = this.options.pane ? map._panes[this.options.pane] :
			this._source instanceof L.Marker ? map._panes.markerPane : map._panes.popupPane;

		if (!this._container) {
			this._initLayout();
		}

		this._pane.appendChild(this._container);

		this._initInteraction();

		this._update();

		this.setOpacity(this.options.opacity);

		map
			.on('moveend', this._onMoveEnd, this)
			.on('viewreset', this._onViewReset, this);

		if (this._animated) {
			map.on('zoomanim', this._zoomAnimation, this);
		}

		if (L.Browser.touch && !this.options.noHide) {
			L.DomEvent.on(this._container, 'click', this.close, this);
			map.on('click', this.close, this);
		}
	},

	onRemove: function (map) {
		this._pane.removeChild(this._container);

		map.off({
			zoomanim: this._zoomAnimation,
			moveend: this._onMoveEnd,
			viewreset: this._onViewReset
		}, this);

		this._removeInteraction();

		this._map = null;
	},

	setLatLng: function (latlng) {
		this._latlng = L.latLng(latlng);
		if (this._map) {
			this._updatePosition();
		}
		return this;
	},

	setContent: function (content) {
		// Backup previous content and store new content
		this._previousContent = this._content;
		this._content = content;

		this._updateContent();

		return this;
	},

	close: function () {
		var map = this._map;

		if (map) {
			if (L.Browser.touch && !this.options.noHide) {
				L.DomEvent.off(this._container, 'click', this.close);
				map.off('click', this.close, this);
			}

			map.removeLayer(this);
		}
	},

	updateZIndex: function (zIndex) {
		this._zIndex = zIndex;

		if (this._container && this._zIndex) {
			this._container.style.zIndex = zIndex;
		}
	},

	setOpacity: function (opacity) {
		this.options.opacity = opacity;

		if (this._container) {
			L.DomUtil.setOpacity(this._container, opacity);
		}
	},

	_initLayout: function () {
		this._container = L.DomUtil.create('div', 'leaflet-label ' + this.options.className + ' leaflet-zoom-animated');
		this.updateZIndex(this._zIndex);
	},

	_update: function () {
		if (!this._map) { return; }

		this._container.style.visibility = 'hidden';

		this._updateContent();
		this._updatePosition();

		this._container.style.visibility = '';
	},

	_updateContent: function () {
		if (!this._content || !this._map || this._prevContent === this._content) {
			return;
		}

		if (typeof this._content === 'string') {
			this._container.innerHTML = this._content;

			this._prevContent = this._content;

			this._labelWidth = this._container.offsetWidth;
			this._labelHeight = this._container.offsetHeight;
		}
	},

	_updatePosition: function () {
		var pos = this._map.latLngToLayerPoint(this._latlng);

		this._setPosition(pos);
	},

	_setPosition: function (pos) {
		var map = this._map,
			container = this._container,
			labelPoint = map.layerPointToContainerPoint(pos),
			direction = this.options.direction,
			labelWidth = this._labelWidth,
			labelHeight = this._labelHeight,
			mapSize = this._map.getSize(),
			offset = L.point(this.options.offset);

		//Remove classnames
		var classnames = ['center', 'top', 'bottom', 'left', 'right'];
        for (var i = 0; i < classnames.length; i++) {
            var classname = classnames[i];
            L.DomUtil.removeClass(container, 'leaflet-label-position--' + classname);
        }

		if (direction === 'auto') {
			var size = this._source.getLayerSize();
			var vOffset = L.point(0, 0);
			var hOffset = L.point(0, 0);
			var className = ['center', 'top'];

            //computing vertical offset
            // label is getting out of the map by the top
            if (labelPoint.y - labelHeight - size.y / 2 < 0) {
                offset = offset.multiplyBy(-1);
                vOffset = L.point(0, size.y + offset.y);
                className[1] = 'bottom';
            }
            else {
                vOffset = L.point(0, - size.y / 2 - labelHeight - offset.y);
            }

            //computing horizontal offset
            if (labelPoint.x + offset.x  + (labelWidth / 2) > mapSize.x) {
                className[0] = 'left';
                hOffset = L.point(- labelWidth, 0);
            } else if (labelPoint.x - (labelWidth / 2) + offset.x < 0) {
                className[0] = 'right';
                hOffset = L.point(0, 0);
            } else {
                //Position label in center
                hOffset = L.point(-labelWidth / 2, 0);
            }

			pos = pos.add(vOffset);
			pos = pos.add(hOffset);
            for (var j = 0; j < className.length; j++) {
                var classN = className[j];
                L.DomUtil.addClass(container, 'leaflet-label-position--' + classN);
            }
		}
		// position to the right (right or auto & needs to)
		else if (direction === 'right') {
			L.DomUtil.addClass(container, 'leaflet-label-position--right');

			pos = pos.add(offset);
		} else { // position to the left
			L.DomUtil.addClass(container, 'leaflet-label-position--left');

			pos = pos.add(L.point(-offset.x - labelWidth, offset.y));
		}


		L.DomUtil.setPosition(container, pos);
	},

	_zoomAnimation: function (opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();

		this._setPosition(pos);
	},

	_onMoveEnd: function () {
		if (!this._animated || this.options.direction === 'auto') {
			this._updatePosition();
		}
	},

	_onViewReset: function (e) {
		/* if map resets hard, we must update the label */
		if (e && e.hard) {
			this._update();
		}
	},

	_initInteraction: function () {
		if (!this.options.clickable) { return; }

		var container = this._container,
			events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.addClass(container, 'leaflet-clickable');
		L.DomEvent.on(container, 'click', this._onMouseClick, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.on(container, events[i], this._fireMouseEvent, this);
		}
	},

	_removeInteraction: function () {
		if (!this.options.clickable) { return; }

		var container = this._container,
			events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu'];

		L.DomUtil.removeClass(container, 'leaflet-clickable');
		L.DomEvent.off(container, 'click', this._onMouseClick, this);

		for (var i = 0; i < events.length; i++) {
			L.DomEvent.off(container, events[i], this._fireMouseEvent, this);
		}
	},

	_onMouseClick: function (e) {
		if (this.hasEventListeners(e.type)) {
			L.DomEvent.stopPropagation(e);
		}

		this.fire(e.type, {
			originalEvent: e
		});
	},

	_fireMouseEvent: function (e) {
		this.fire(e.type, {
			originalEvent: e
		});

		// TODO proper custom event propagation
		// this line will always be called if marker is in a FeatureGroup
		if (e.type === 'contextmenu' && this.hasEventListeners(e.type)) {
			L.DomEvent.preventDefault(e);
		}
		if (e.type !== 'mousedown') {
			L.DomEvent.stopPropagation(e);
		} else {
			L.DomEvent.preventDefault(e);
		}
	}
});


/*global LeafletLabel */

// This object is a mixin for L.Marker and L.CircleMarker. We declare it here as both need to include the contents.
L.BaseMarkerMethods = {
	showLabel: function () {
		if (this.label && this._map) {
			this.label.setLatLng(this._latlng);
			this._map.showLabel(this.label);
		}

		return this;
	},

	hideLabel: function () {
		if (this.label) {
			this.label.close();
		}
		return this;
	},

	setLabelNoHide: function (noHide) {
		if (this._labelNoHide === noHide) {
			return;
		}

		this._labelNoHide = noHide;

		if (noHide) {
			this._removeLabelRevealHandlers();
			this.showLabel();
		} else {
			this._addLabelRevealHandlers();
			this.hideLabel();
		}
	},

	bindLabel: function (content, options) {
		var labelAnchor = this.options.icon ? this.options.icon.options.labelAnchor : this.options.labelAnchor,
			anchor = L.point(labelAnchor) || L.point(0, 0);

		anchor = anchor.add(LeafletLabel.prototype.options.offset);

		if (options && options.offset) {
			anchor = anchor.add(options.offset);
		}

		options = L.Util.extend({offset: anchor}, options);

		this._labelNoHide = options.noHide;

		if (!this.label) {
			if (!this._labelNoHide) {
				this._addLabelRevealHandlers();
			}

			this
				.on('remove', this.hideLabel, this)
				.on('move', this._moveLabel, this)
				.on('add', this._onMarkerAdd, this);

			this._hasLabelHandlers = true;
		}

		this.label = new LeafletLabel(options, this)
			.setContent(content);

		return this;
	},

	unbindLabel: function () {
		if (this.label) {
			this.hideLabel();

			this.label = null;

			if (this._hasLabelHandlers) {
				if (!this._labelNoHide) {
					this._removeLabelRevealHandlers();
				}

				this
					.off('remove', this.hideLabel, this)
					.off('move', this._moveLabel, this)
					.off('add', this._onMarkerAdd, this);
			}

			this._hasLabelHandlers = false;
		}
		return this;
	},

	updateLabelContent: function (content) {
		if (this.label) {
			this.label.setContent(content);
		}
	},

	getLabel: function () {
		return this.label;
	},

	_onMarkerAdd: function () {
		if (this._labelNoHide) {
			this.showLabel();
		}
	},

	_addLabelRevealHandlers: function () {
		this
			.on('mouseover', this.showLabel, this)
			.on('mouseout', this.hideLabel, this);

		if (L.Browser.touch) {
			this.on('click', this.showLabel, this);
		}
	},

	_removeLabelRevealHandlers: function () {
		this
			.off('mouseover', this.showLabel, this)
			.off('mouseout', this.hideLabel, this);

		if (L.Browser.touch) {
			this.off('click', this.showLabel, this);
		}
	},

	_moveLabel: function (e) {
		this.label.setLatLng(e.latlng);
	}
};


// Add in an option to icon that is used to set where the label anchor is
L.Icon.Default.mergeOptions({
	labelAnchor: new L.Point(9, -20)
});

// Have to do this since Leaflet is loaded before this plugin and initializes
// L.Marker.options.icon therefore missing our mixin above.
L.Marker.mergeOptions({
	icon: new L.Icon.Default()
});

L.Marker.include(L.BaseMarkerMethods);
L.Marker.include({
	_originalUpdateZIndex: L.Marker.prototype._updateZIndex,

	_updateZIndex: function (offset) {
		var zIndex = this._zIndex + offset;

		this._originalUpdateZIndex(offset);

		if (this.label) {
			this.label.updateZIndex(zIndex);
		}
	},

	_originalSetOpacity: L.Marker.prototype.setOpacity,

	setOpacity: function (opacity, labelHasSemiTransparency) {
		this.options.labelHasSemiTransparency = labelHasSemiTransparency;

		this._originalSetOpacity(opacity);
	},

	_originalUpdateOpacity: L.Marker.prototype._updateOpacity,

	_updateOpacity: function () {
		var absoluteOpacity = this.options.opacity === 0 ? 0 : 1;

		this._originalUpdateOpacity();

		if (this.label) {
			this.label.setOpacity(this.options.labelHasSemiTransparency ? this.options.opacity : absoluteOpacity);
		}
	},

	_originalSetLatLng: L.Marker.prototype.setLatLng,

	setLatLng: function (latlng) {
		if (this.label && !this._labelNoHide) {
			this.hideLabel();
		}

		return this._originalSetLatLng(latlng);
	},

	getLayerSize: function () {
		if (this.getRadius) {
			var size = (this.getRadius() + this.options.weight) * 2;
			return new L.Point(size, size);
		}
		if (this.options.icon) {
			return new L.point(this.options.icon.options.iconSize);
		}
		return new L.Point(0, 0);
	}
});

// Add in an option to icon that is used to set where the label anchor is
L.CircleMarker.mergeOptions({
	labelAnchor: new L.Point(0, 0)
});


L.CircleMarker.include(L.BaseMarkerMethods);

/*global LeafletLabel */
var polylabel = polylabel || function () {};

L.Path.include({
	bindLabel: function (content, options) {
		this._labelNoHide = options.noHide;
		// Crazy use of fake context to prevent .off from removing parent event listeners...
		this.context = {parent: this};

		if (!this.label) {
			if (!this._labelNoHide) {
				this
					.on('mouseover', this._showLabel, this.context)
					.on('mousemove', this._moveLabel, this.context)
					.on('mouseout', this._hideLabel, this.context);

				if (L.Browser.touch) {
					this.on('click', this._showLabel, this.context);
				}
			}

			this.on('remove', this._hideLabel, this.context);

			if (this._labelNoHide) {
				this.on('add', this._showLabel, this.context);
			}


			this._hasLabelHandlers = true;
		}

		this.label = new LeafletLabel(options, this)
			.setContent(content);

		return this;
	},

	unbindLabel: function () {
		if (this.label) {
			this._hideLabel.apply(this.context);
			this.label = null;
			this
				.off('mouseover add', this._showLabel, this.context)
				.off('mousemove', this._moveLabel, this.context)
				.off('mouseout remove', this._hideLabel, this.context);
		}
		return this;
	},

	updateLabelContent: function (content) {
		if (this.label) {
			this.label.setContent(content);
		}
	},

	getLayerSize: function () {
		//Cannot determine precisely the size of the polygon
		return new L.Point(0, 0, false);
	},

	getCentroid: function () {
		if (this instanceof L.Polygon) {
			return this._getCentroidIsh();
		}
		else {
			return this.getBounds().getCenter();
		}
	},

	_getCentroidIsh: function () {
		var layer = this,
			center;

		var geoJson = layer.toGeoJSON();
		if (geoJson.geometry) {
            center = polylabel(geoJson.geometry.coordinates);
		}


		return new L.LatLng(center[0], center[1]);
	},

	_showLabel: function (e) {
		if (!this.parent._centroid) {
			this.parent._centroid = this.parent.getCentroid();
		}

		if (this.parent._centroid && this.parent.label && this.parent._map) {
			this.parent.label.setLatLng(this.parent._centroid);
			this.parent._map.showLabel(this.parent.label);
		}
	},

	_moveLabel: function (e) {
		this.parent.label.setLatLng(e.latlng);
	},

	_hideLabel: function () {
		if (this.parent.label) {
			this.parent.label.close();
		}
	},

	_originalBringToFront: L.Path.prototype.bringToFront,

	bringToFront: function () {
		this._originalBringToFront();

		if (this.label) {
			this.label.updateZIndex(100000);
		}
	},

	_originalBringToBack: L.Path.prototype.bringToBack,

	bringToBack: function () {
		this._originalBringToBack();

		if (this.label) {
			this.label.updateZIndex(1);
		}
	}
});

L.Map.include({
	showLabel: function (label) {
		return this.addLayer(label);
	}
});

L.FeatureGroup.include({
	// TODO: remove this when AOP is supported in Leaflet, need this as we cannot put code in removeLayer()
	clearLayers: function () {
		this.unbindLabel();
		this.eachLayer(this.removeLayer, this);
		return this;
	},

	bindLabel: function (content, options) {
		return this.invoke('bindLabel', content, options);
	},

	unbindLabel: function () {
		return this.invoke('unbindLabel');
	},

	updateLabelContent: function (content) {
		this.invoke('updateLabelContent', content);
	},

    _originalBringToFront: L.FeatureGroup.prototype.bringToFront,

    bringToFront: function () {
		var layerKeys = Object.keys(this._layers).sort();

		layerKeys.forEach(function (key) {
            var layer = this._layers[key];
            layer.bringToFront();
		}.bind(this));
    },

    _originalBringToBack: L.FeatureGroup.prototype.bringToBack,

	bringToBack: function () {
        var layerKeys = Object.keys(this._layers).sort().reverse();

        layerKeys.forEach(function (key) {
            var layer = this._layers[key];
            layer.bringToBack();
        }.bind(this));
	}
});

	return LeafletLabel;
}, window));
