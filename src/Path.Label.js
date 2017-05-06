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

		//thanks geojson reversed coordinates...
		return new L.LatLng(center[1], center[0]);
	},

	_showLabel: function (e) {
		if (!this._labelNoHide) {
			this.parent.label.setLatLng(e.latlng);
            this.parent._map.showLabel(this.parent.label);
		}
		else {
            if (!this.parent._centroid) {
                this.parent._centroid = this.parent.getCentroid();
            }

            if (this.parent._centroid && this.parent.label && this.parent._map) {
                this.parent.label.setLatLng(this.parent._centroid);
                this.parent._map.showLabel(this.parent.label);
            }
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