// Initialize the map
let myMap = L.map("map", {
    center: [0, 0],
    zoom: 3
  });
   
  // Define base maps with cleaner borders
  let street = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '©OpenStreetMap, ©CartoDB'
  });
   
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '©OpenStreetMap, ©OpenTopoMap'
  });
   
  let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '©Esri'
  });
   
  // Create a baseMaps object
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Satellite": satellite
  };
   
  // Add the street map to the map
  street.addTo(myMap);
   
  // Create layer groups
  let earthquakes = new L.LayerGroup();
  let tectonicPlates = new L.LayerGroup();
   
  // Create an overlay object
  let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };
   
  // Add layer control
  L.control.layers(baseMaps, overlayMaps).addTo(myMap);
   
  // Function to determine marker size based on magnitude
  function getMarkerSize(magnitude) {
    return magnitude * 4;
  }
   
  // Function to determine marker color based on depth
  function getMarkerColor(depth) {
    return depth > 90 ? '#FF0000' :
           depth > 70 ? '#FF4500' :
           depth > 50 ? '#FFA500' :
           depth > 30 ? '#FFFF00' :
           depth > 10 ? '#ADFF2F' :
                        '#00FF00';
  }
   
  // Function to create popups
  function createPopup(feature) {
    return `<strong>Location:</strong> ${feature.properties.place}<br>
            <strong>Magnitude:</strong> ${feature.properties.mag}<br>
            <strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`;
  }
   
  // Fetch earthquake data and add it to the map
  fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng, {
            radius: getMarkerSize(feature.properties.mag),
            fillColor: getMarkerColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        },
        onEachFeature: function(feature, layer) {
          layer.bindPopup(createPopup(feature));
        }
      }).addTo(earthquakes);
   
      earthquakes.addTo(myMap);
   
      // Create legend
      let legend = L.control({position: 'bottomright'});
      legend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [0, 10, 30, 50, 70, 90];
        let labels = [];
   
        for (let i = 0; i < depths.length; i++) {
          labels.push(
            '<i style="background:' + getMarkerColor(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km' : '+ km')
          );
        }
   
        div.innerHTML = labels.join('<br>');
        return div;
      };
      legend.addTo(myMap);
    });
   
  // Fetch tectonic plates data and add it to the map
  fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
    .then(response => response.json())
    .then(data => {
      L.geoJSON(data, {
        color: "orange",
        weight: 2
      }).addTo(tectonicPlates);
   
      tectonicPlates.addTo(myMap);
    });