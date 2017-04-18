/*global LeafletLabel */

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

	_centerOfTriangle: function (triangle) {
		var points = triangle.points_;

		return {
			x: (points[0].x + points[1].x + points[2].x) / 3,
			y: (points[0].y + points[1].y + points[2].y) / 3
		};
	},

	_areaOfTriangle: function (triangle) {
		var points = triangle.points_,
			point1 = points[0],
			point2 = points[1],
			point3 = points[2],
			x1 = point1.x,
			x2 = point2.x,
			x3 = point3.x,
			y1 = point1.y,
			y2 = point2.y,
			y3 = point3.y;

		return ((x1 * (y2 - y3)) + (x2 * (y3 - y1)) + (x3 * (y1 - y2))) / 2;
	},
	_largestTriangle: function (triangles) {
		var largest = null,
			triangle,
			i = 0;


		for (; i < triangles.length; i++) {
			triangle = triangles[i];
			triangle.area = this._areaOfTriangle(triangle);
			if (largest === null) {
				largest = triangle;
				continue;
			}

			if (triangle.area > largest.area) {
				largest = triangle;
			}
		}

		return largest;
	},
	_getCentroidIsh: function () {
		var layer = this,
			latlngs = layer._latlngs,
			length = latlngs.length,
			contour = [],
			latlng,
			i = 0,
			swctx,
			center;

		for (; i < length; i++) {
			latlng = latlngs[i];
			contour.push(new poly2tri.Point(latlng.lat, latlng.lng));
		}

		swctx = new poly2tri.SweepContext(contour);
		swctx.triangulate();

		var triangles = swctx.getTriangles();
		var triangle = this._largestTriangle(triangles);
		center = this._centerOfTriangle(triangle);

		return new L.LatLng(center.x, center.y);
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