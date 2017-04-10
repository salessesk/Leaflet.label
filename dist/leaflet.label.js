/*
	Leaflet.label, a plugin that adds labels to markers and vectors for Leaflet powered maps.
	(c) 2012-2013, Jacob Toye, Smartrak

	https://github.com/Leaflet/Leaflet.label
	http://leafletjs.com
	https://github.com/jacobtoye
*/
!function(t,e){"undefined"!=typeof e&&e.L?e.LeafletLabel=t(L):"function"==typeof define&&define.amd?define(["leaflet"],t):"object"==typeof exports&&(module.exports=t(require("leaflet")))}(function(t){t.labelVersion="0.2.4";var e=t.Class.extend({includes:t.Mixin.Events,options:{className:"",clickable:!1,direction:"auto",noHide:!1,offset:[0,6],opacity:1,zoomAnimation:!0},initialize:function(e,i){t.setOptions(this,e),this._source=i,this._animated=t.Browser.any3d&&this.options.zoomAnimation,this._isOpen=!1},onAdd:function(e){this._map=e,this._pane=this.options.pane?e._panes[this.options.pane]:this._source instanceof t.Marker?e._panes.markerPane:e._panes.popupPane,this._container||this._initLayout(),this._pane.appendChild(this._container),this._initInteraction(),this._update(),this.setOpacity(this.options.opacity),e.on("moveend",this._onMoveEnd,this).on("viewreset",this._onViewReset,this),this._animated&&e.on("zoomanim",this._zoomAnimation,this),t.Browser.touch&&!this.options.noHide&&(t.DomEvent.on(this._container,"click",this.close,this),e.on("click",this.close,this))},onRemove:function(t){this._pane.removeChild(this._container),t.off({zoomanim:this._zoomAnimation,moveend:this._onMoveEnd,viewreset:this._onViewReset},this),this._removeInteraction(),this._map=null},setLatLng:function(e){return this._latlng=t.latLng(e),this._map&&this._updatePosition(),this},setContent:function(t){return this._previousContent=this._content,this._content=t,this._updateContent(),this},close:function(){var e=this._map;e&&(t.Browser.touch&&!this.options.noHide&&(t.DomEvent.off(this._container,"click",this.close),e.off("click",this.close,this)),e.removeLayer(this))},updateZIndex:function(t){this._zIndex=t,this._container&&this._zIndex&&(this._container.style.zIndex=t)},setOpacity:function(e){this.options.opacity=e,this._container&&t.DomUtil.setOpacity(this._container,e)},_initLayout:function(){this._container=t.DomUtil.create("div","leaflet-label "+this.options.className+" leaflet-zoom-animated"),this.updateZIndex(this._zIndex)},_update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updatePosition(),this._container.style.visibility="")},_updateContent:function(){this._content&&this._map&&this._prevContent!==this._content&&"string"==typeof this._content&&(this._container.innerHTML=this._content,this._prevContent=this._content,this._labelWidth=this._container.offsetWidth,this._labelHeight=this._container.offsetHeight)},_updatePosition:function(){var t=this._map.latLngToLayerPoint(this._latlng);this._setPosition(t)},_setPosition:function(e){var i=this._map,n=this._container,o=i.layerPointToContainerPoint(e),s=this.options.direction,a=this._labelWidth,h=this._labelHeight,l=this._map.getSize(),r=t.point(this.options.offset);if("auto"===s){var c=this._source.getLayerSize(),d=t.point(0,0),u=t.point(0,0),_=["center","top"];o.y-h-c[1]/2<0?(d=t.point(0,c[1]/2+r.y),_[1]="bottom"):d=t.point(0,-c[1]/2-h-r.y),o.x+r.x+a/2>l.x?(_[0]="left",u=t.point(-a,0)):o.x-a/2+r.x<0?(_[0]="right",u=t.point(0,0)):u=t.point(-a/2,0),e=e.add(d),e=e.add(u),t.DomUtil.addClass(n,"leaflet-label-"+_.join("-"))}else"right"===s?(t.DomUtil.addClass(n,"leaflet-label-right"),t.DomUtil.removeClass(n,"leaflet-label-left"),e=e.add(r)):(t.DomUtil.addClass(n,"leaflet-label-left"),t.DomUtil.removeClass(n,"leaflet-label-right"),e=e.add(t.point(-r.x-a,r.y)));t.DomUtil.setPosition(n,e)},_zoomAnimation:function(t){var e=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center).round();this._setPosition(e)},_onMoveEnd:function(){this._animated&&"auto"!==this.options.direction||this._updatePosition()},_onViewReset:function(t){t&&t.hard&&this._update()},_initInteraction:function(){if(this.options.clickable){var e=this._container,i=["dblclick","mousedown","mouseover","mouseout","contextmenu"];t.DomUtil.addClass(e,"leaflet-clickable"),t.DomEvent.on(e,"click",this._onMouseClick,this);for(var n=0;n<i.length;n++)t.DomEvent.on(e,i[n],this._fireMouseEvent,this)}},_removeInteraction:function(){if(this.options.clickable){var e=this._container,i=["dblclick","mousedown","mouseover","mouseout","contextmenu"];t.DomUtil.removeClass(e,"leaflet-clickable"),t.DomEvent.off(e,"click",this._onMouseClick,this);for(var n=0;n<i.length;n++)t.DomEvent.off(e,i[n],this._fireMouseEvent,this)}},_onMouseClick:function(e){this.hasEventListeners(e.type)&&t.DomEvent.stopPropagation(e),this.fire(e.type,{originalEvent:e})},_fireMouseEvent:function(e){this.fire(e.type,{originalEvent:e}),"contextmenu"===e.type&&this.hasEventListeners(e.type)&&t.DomEvent.preventDefault(e),"mousedown"!==e.type?t.DomEvent.stopPropagation(e):t.DomEvent.preventDefault(e)}});return t.BaseMarkerMethods={showLabel:function(){return this.label&&this._map&&(this.label.setLatLng(this._latlng),this._map.showLabel(this.label)),this},hideLabel:function(){return this.label&&this.label.close(),this},setLabelNoHide:function(t){this._labelNoHide!==t&&(this._labelNoHide=t,t?(this._removeLabelRevealHandlers(),this.showLabel()):(this._addLabelRevealHandlers(),this.hideLabel()))},bindLabel:function(i,n){var o=this.options.icon?this.options.icon.options.labelAnchor:this.options.labelAnchor,s=t.point(o)||t.point(0,0);return s=s.add(e.prototype.options.offset),n&&n.offset&&(s=s.add(n.offset)),n=t.Util.extend({offset:s},n),this._labelNoHide=n.noHide,this.label||(this._labelNoHide||this._addLabelRevealHandlers(),this.on("remove",this.hideLabel,this).on("move",this._moveLabel,this).on("add",this._onMarkerAdd,this),this._hasLabelHandlers=!0),this.label=new e(n,this).setContent(i),this},unbindLabel:function(){return this.label&&(this.hideLabel(),this.label=null,this._hasLabelHandlers&&(this._labelNoHide||this._removeLabelRevealHandlers(),this.off("remove",this.hideLabel,this).off("move",this._moveLabel,this).off("add",this._onMarkerAdd,this)),this._hasLabelHandlers=!1),this},updateLabelContent:function(t){this.label&&this.label.setContent(t)},getLabel:function(){return this.label},_onMarkerAdd:function(){this._labelNoHide&&this.showLabel()},_addLabelRevealHandlers:function(){this.on("mouseover",this.showLabel,this).on("mouseout",this.hideLabel,this),t.Browser.touch&&this.on("click",this.showLabel,this)},_removeLabelRevealHandlers:function(){this.off("mouseover",this.showLabel,this).off("mouseout",this.hideLabel,this),t.Browser.touch&&this.off("click",this.showLabel,this)},_moveLabel:function(t){this.label.setLatLng(t.latlng)}},t.Icon.Default.mergeOptions({labelAnchor:new t.Point(9,-20)}),t.Marker.mergeOptions({icon:new t.Icon.Default}),t.Marker.include(t.BaseMarkerMethods),t.Marker.include({_originalUpdateZIndex:t.Marker.prototype._updateZIndex,_updateZIndex:function(t){var e=this._zIndex+t;this._originalUpdateZIndex(t),this.label&&this.label.updateZIndex(e)},_originalSetOpacity:t.Marker.prototype.setOpacity,setOpacity:function(t,e){this.options.labelHasSemiTransparency=e,this._originalSetOpacity(t)},_originalUpdateOpacity:t.Marker.prototype._updateOpacity,_updateOpacity:function(){var t=0===this.options.opacity?0:1;this._originalUpdateOpacity(),this.label&&this.label.setOpacity(this.options.labelHasSemiTransparency?this.options.opacity:t)},_originalSetLatLng:t.Marker.prototype.setLatLng,setLatLng:function(t){return this.label&&!this._labelNoHide&&this.hideLabel(),this._originalSetLatLng(t)},getLayerSize:function(){if(this.getRadius){var e=2*(this.getRadius()+this.options.weight);return new t.Point(e,e)}return this.options.icon?this.options.icon.options.iconSize:new t.Point(0,0)}}),t.CircleMarker.mergeOptions({labelAnchor:new t.Point(0,0)}),t.CircleMarker.include(t.BaseMarkerMethods),t.Path.include({bindLabel:function(i,n){return this.label&&this.label.options===n||(this.label=new e(n,this)),this.label.setContent(i),this._showLabelAdded||(this.on("mouseover",this._showLabel,this).on("mousemove",this._moveLabel,this).on("mouseout remove",this._hideLabel,this),t.Browser.touch&&this.on("click",this._showLabel,this),this._showLabelAdded=!0),this},unbindLabel:function(){return this.label&&(this._hideLabel(),this.label=null,this._showLabelAdded=!1,this.off("mouseover",this._showLabel,this).off("mousemove",this._moveLabel,this).off("mouseout remove",this._hideLabel,this)),this},updateLabelContent:function(t){this.label&&this.label.setContent(t)},getLayerSize:function(){var e=this.getBounds(),i=this._map.latLngToLayerPoint(e.getNorthWest()),n=this._map.latLngToLayerPoint(e.getSouthEast());return new t.Point(Math.abs(n.x-i.x),Math.abs(i.y-n.y),!1)},_showLabel:function(t){this.label.setLatLng(t.latlng),this._map.showLabel(this.label)},_moveLabel:function(t){this.label.setLatLng(t.latlng)},_hideLabel:function(){this.label.close()}}),t.Map.include({showLabel:function(t){return this.addLayer(t)}}),t.FeatureGroup.include({clearLayers:function(){return this.unbindLabel(),this.eachLayer(this.removeLayer,this),this},bindLabel:function(t,e){return this.invoke("bindLabel",t,e)},unbindLabel:function(){return this.invoke("unbindLabel")},updateLabelContent:function(t){this.invoke("updateLabelContent",t)}}),e},window);