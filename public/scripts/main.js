document.body.onload = () => {
  const colors = [
    "#3388ff",
    "#025100",
    "#ffff00",
    "#ff0000",
    "#fdc527",
    "#6500a2",
    "#e892a2",
    "#4fc5ff",
    "#00ff00",
  ];

  var map = L.map("map").setView([51.1229, -114.01586], 13),
    drawnItems = new L.FeatureGroup().addTo(map),
    editMarkerActions = [
      LeafletToolbar.EditAction.Popup.Edit,
      LeafletToolbar.EditAction.Popup.Delete,
    ],
    editCircleActions = [
      LeafletToolbar.EditAction.Popup.Edit,
      LeafletToolbar.EditAction.Popup.Delete,
      LeafletToolbar.ToolbarAction.extendOptions({
        toolbarIcon: {
          className: "leaflet-color-picker",
          html: "<span>🎨</span>",
        },
        subToolbar: new LeafletToolbar({
          actions: [
            ...colors.map((color) => L.ColorPicker.extendOptions({ color })),
          ],
        }),
      }),
    ];

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  new LeafletToolbar.DrawToolbar({
    actions: [
      LeafletToolbar.DrawAction.Marker,
      LeafletToolbar.DrawAction.Circle,
    ],
  }).addTo(map);

  map.on(L.Draw.Event.CREATED, function (event) {
    if (event.layerType === "marker") {
      const poi = {
        location: {
          latitude: event.layer._latlng.lat,
          longitude: event.layer._latlng.lng,
        },
      };
      saveEntity("POST", "poi", poi);
    } else if (event.layerType === "circle") {
      const soe = {
        location: {
          latitude: event.layer._latlng.lat,
          longitude: event.layer._latlng.lng,
        },
        radius: event.layer._mRadius,
        type: 0,
      };

      saveEntity("POST", "soe", soe);
    }
  });

  function drawMarker(poi) {
    var marker = new L.marker([poi.location.latitude, poi.location.longitude]);
    marker.id = poi.id;
    drawnItems.addLayer(marker);

    marker.on("click", (event) => {
      new LeafletToolbar.EditToolbar.Popup(event.latlng, {
        actions: editMarkerActions,
      }).addTo(map, marker);
    });

    marker.on("move", (event) => {
      const poi = {
        id: event.target.id,
        location: {
          latitude: event.target._latlng.lat,
          longitude: event.target._latlng.lng,
        },
      };
      saveEntity("PATCH", "poi", poi);
    });

    marker.on("remove", (event) => {
      saveEntity("DELETE", "poi", { id: event.target.id });
    });
  }

  function drawCircle(soe) {
    const type = soe.type ? soe.type : 0;
    const shapeOptions = { color: colors[type] };
    var circle = new L.circle(
      [soe.location.latitude, soe.location.longitude],
      soe.radius,
      shapeOptions
    );

    circle.id = soe.id;
    drawnItems.addLayer(circle);

    circle.on("edit", (event) => {
      const soe = {
        id: event.target.id,
        location: {
          latitude: event.target._latlng.lat,
          longitude: event.target._latlng.lng,
        },
        radius: event.target._mRadius,
      };
      saveEntity("PATCH", "soe", soe);
    });

    circle.on("edit:color", (event) => {
      saveEntity("PATCH", "soe", {
        id: event.target.id,
        type: colors.indexOf(event.color),
      });
    });

    circle.on("remove", (event) => {
      saveEntity("DELETE", "soe", { id: event.target.id });
    });

    circle.on("click", (event) => {
      new LeafletToolbar.EditToolbar.Popup(event.latlng, {
        actions: editCircleActions,
      }).addTo(map, circle);
    });
  }

  function saveEntity(method = "POST", path, entity = null) {
    const id = entity.id ? entity.id : "";

    fetch(`/${path}/${id}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entity),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && method === "POST" && path === "poi") {
          drawMarker(data);
        } else if (data && method === "POST" && path === "soe") {
          drawCircle(data);
        }
      });
  }

  fetch("/poi")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((poi) => {
        drawMarker(poi);
      });
    });

  fetch("/soe")
    .then((response) => response.json())
    .then((data) => {
      data.forEach((soe) => {
        drawCircle(soe);
      });
    });
};
