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

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/

let collisionData;

// Fetch GeoJSON from GitHub raw link and update source
fetch('https://raw.githubusercontent.com/lilydengg/GGR472-Lab-4/main/data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(response => {
        console.log(response);
        collisionData = response;
    });

/*--------------------------------------------------------------------
Step 3: CREATE BOUNDING BOX AND HEXGRID
--------------------------------------------------------------------*/

map.on("load", () => {
    let bboxresult = turf.bbox(collisionData);
    let hexdata = turf.hexGrid(bboxresult, 0.5, { units: "kilometers" });

    let collishex = turf.collect(hexdata, collisionData, "_id", "values");

    let maxCollisions = 0;
    collishex.features.forEach((feature) => {
        feature.properties.COUNT = feature.properties.values.length;
        if (feature.properties.COUNT > maxCollisions) {
            maxCollisions = feature.properties.COUNT;
        }
    });

    // Add hex grid source to map
    map.addSource("collishexgrid", {
        type: "geojson",
        data: collishex
    });

    map.addLayer({
        'id': 'collishexgrid',
        'type': 'fill',
        'source': 'collishexgrid',
        'layout': { 'visibility': 'visible' }, // so the initial visibility is visible
        'paint': {
            'fill-outline-color': '#000',
            'fill-color': [
                'step',
                ['get', 'COUNT'],
                '#def3ec',  // 0 - 9
                10, '#88d9be',  // 10 - 49
                50, '#4cae8d',  // 50 - max
                maxCollisions, '#207457'  // max collisions
            ],
            'fill-opacity': 0.9
        },
        filter: ['!=', "COUNT", 0]
    });

    /*--------------------------------------------------------------------
ADD INTERACTIVITY BASED ON HTML EVENT
--------------------------------------------------------------------*/


// 1) Toggle legend display based on checkbox
let legendcheck = document.getElementById('legendcheck');
let legend = document.getElementById('legend'); // Ensure you have this element in your HTML

legendcheck.addEventListener('click', () => {
    if (legendcheck.checked) {
        legend.style.display = 'block';
    } else {
        legend.style.display = 'none';
    }
});

// 2) Toggle Collision Hexgrid Layer
document.getElementById('collisioncheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'collishexgrid',  // Layer ID for collision hexgrid
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// 3) Toggle Cycling Network Layer
document.getElementById('cyclingcheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'cyclingNetwork',  // Layer ID for cycling network
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});


    // Fetch the cycling network GeoJSON and add it as a layer (data taken from Toronto Open Data https://open.toronto.ca/dataset/cycling-network/)
    fetch('https://raw.githubusercontent.com/lilydengg/GGR472-Lab-4/main/data/cycling-network%20-%204326.geojson')
        .then(response => response.json())
        .then(cyclingData => {
            // Add the source to the map
            map.addSource("cyclingNetwork", {
                type: "geojson",
                data: cyclingData
            });

            // Add a line layer to represent the cycling network
            map.addLayer({
                id: "cyclingNetwork",
                type: "line",
                source: "cyclingNetwork",
                layout: { 'visibility': 'visible' }, // so the cycling network starts visible
                paint: {
                    "line-color": "#1f78b4",  // Blue color for cycling paths
                    "line-width": 2,
                    "line-opacity": 0.8
                }
            });

            /*** ADD LEGEND ***/
            const legend = document.getElementById("legend");
            legend.innerHTML = ""; // Clear previous legend

            // Collision data legend
            const legendCategories = [
                { color: "#def3ec", label: "0 - 9 collisions" },
                { color: "#88d9be", label: "10 - 49 collisions" },
                { color: "#4cae8d", label: "50 - " + (maxCollisions - 1) + " collisions" },
                { color: "#207457", label: maxCollisions + "+ collisions" }
            ];

            legendCategories.forEach(category => {
                const item = document.createElement("div");
                item.className = "legend-item";

                const colorBox = document.createElement("div");
                colorBox.className = "legend-color";
                colorBox.style.backgroundColor = category.color;

                const label = document.createElement("span");
                label.textContent = category.label;

                item.appendChild(colorBox);
                item.appendChild(label);
                legend.appendChild(item);
            });

            // Cycling network legend
            const cyclingLegendItem = document.createElement("div");
            cyclingLegendItem.className = "legend-item";

            const cyclingLine = document.createElement("div");
            cyclingLine.className = "legend-line";
            cyclingLine.style.background = "#1f78b4"; // Blue color for cycling network
            cyclingLine.style.width = "18px";
            cyclingLine.style.height = "4px"; // Thin line

            const cyclingLabel = document.createElement("span");
            cyclingLabel.textContent = "Cycling Network";

            cyclingLegendItem.appendChild(cyclingLine);
            cyclingLegendItem.appendChild(cyclingLabel);
            legend.appendChild(cyclingLegendItem);
        })
        .catch(error => console.error("Error loading cycling network data:", error));
});

// Pop-up for collision hex grid
map.on("click", "collishexgrid", (e) => {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("<b>Collision count: </b>" + e.features[0].properties.COUNT)
        .addTo(map);
});
