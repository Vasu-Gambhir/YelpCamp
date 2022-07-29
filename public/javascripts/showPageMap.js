mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/light-v10", // style URL
  center: foundCampground.geometry.coordinates, // starting position [lng, lat]
  zoom: 8, // starting zoom
  projection: "globe", // display the map as a 3D globe
});
map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker()
  .setLngLat(foundCampground.geometry.coordinates)
  .setPopup(new mapboxgl.Popup({offset : 25})
  .setHTML(`<h3>${foundCampground.title}</h3><p>${foundCampground.location}</p>`))
  .addTo(map);
