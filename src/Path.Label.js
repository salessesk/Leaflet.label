/*global LeafletLabel */

L.Path.include({
	bindLabel: function (content, options) {
		this._labelNoHide = options.noHide;

		if (!this.label) {
			if (!this._labelNoHide) {
				this
					.on('mouseover', this._showLabel, this)
					.on('mousemove', this._moveLabel, this)
					.on('mouseout', this._hideLabel, this);

				if (L.Browser.touch) {
					this.on('click', this._showLabel, this);
				}
			}

			this.on('remove', this._hideLabel, this);

			if (this._labelNoHide) {
				this.on('add', this._showLabel, this);
			}


			this._hasLabelHandlers = true;
		}

		this.label = new LeafletLabel(options, this)
			.setContent(content);

		return this;
	},

	unbindLabel: function () {
		if (this.label) {
			this._hideLabel();
			this.label = null;
			this._showLabelAdded = false;
			this
				.off('mouseover', this._showLabel, this)
				.off('mousemove', this._moveLabel, this)
				.off('mouseout remove', this._hideLabel, this);
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
		if (this.label && this._map) {
			this.label.setLatLng(this.getCentroid());
			this._map.showLabel(this.label);
		}

		return this;
	},

	_moveLabel: function (e) {
		this.label.setLatLng(e.latlng);
	},

	_hideLabel: function () {
		if (this.label) {
			this.label.close();
		}

		return this;
	}
});
