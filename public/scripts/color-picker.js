// Based on \leaflet-draw-toolbar\examples\ColorPicker.js
L.ColorPicker = LeafletToolbar.ToolbarAction.extend({
	options: {
		toolbarIcon: { className: 'leaflet-color-swatch' }
	},

	initialize: function(map, shape, options) {
		this._shape = shape;

		L.setOptions(this, options);
		LeafletToolbar.ToolbarAction.prototype.initialize.call(this, map, options);
	},

	addHooks: function() {
		this._shape.setStyle({ color: this.options.color });
		this.disable();

        // Event fired on color change
		this._shape.fire('edit:color', { color: this.options.color });
	},

	_createIcon: function(toolbar, container, args) {
		var colorSwatch = L.DomUtil.create('div'),
			width, height;

		LeafletToolbar.ToolbarAction.prototype._createIcon.call(this, toolbar, container, args);

		L.extend(colorSwatch.style, {
			backgroundColor: this.options.color,
			width: L.DomUtil.getStyle(this._link, 'width'),
			height: L.DomUtil.getStyle(this._link, 'height'),
			border: '3px solid ' + L.DomUtil.getStyle(this._link, 'backgroundColor')
		});

		this._link.appendChild(colorSwatch);

		L.DomEvent.on(this._link, 'click', function() {
			map.removeLayer(this.toolbar.parentToolbar);
		}, this);
	}
});