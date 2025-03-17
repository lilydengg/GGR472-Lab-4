/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js 
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoibGlseWRlbmciLCJhIjoiY201eGIwOG5jMDB6ZDJqcHJrdGtudzVscSJ9.-cRhTqv-44DxjWWHAi9GmQ'; //****ADD YOUR PUBLIC ACCESS TOKEN*****

// Initialize map and edit to your preference
const map = new mapboxgl.Map({
    container: 'map', // container id in HTML
    style: 'mapbox://styles/lilydeng/cm896sf8w002n01qq0dxx5ebq',  // ****ADD MAP STYLE HERE *****
    center: [-79.39, 43.65],  // starting point, longitude/latitude
    zoom: 11 // starting zoom level
});

map.addControl(new mapboxgl.NavigationControl()); // Add zoom and rotation controls to the map
