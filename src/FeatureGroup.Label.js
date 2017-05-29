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
            if (layer.bringToFront) {
                layer.bringToFront();
            }
        }.bind(this));
    },

    _originalBringToBack: L.FeatureGroup.prototype.bringToBack,

    bringToBack: function () {
        var layerKeys = Object.keys(this._layers).sort().reverse();

        layerKeys.forEach(function (key) {
            var layer = this._layers[key];
            if (layer.bringToBack) {
                layer.bringToBack();
            }
        }.bind(this));
    }
});