let geoData;
let facilityList = document.getElementsByClassName('body-list')
let currentPosition
var map
var marker
var popup
let cordinate1
let cordinate2
var myDiv 

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}


const successCallback = async (position) => {
    currentPosition = await position
    setDiv()
};


fetch(
    "https://opendata.bristol.gov.uk/api/records/1.0/search/?dataset=public-toilets-community&q=&rows=100"
)
    .then((response) => response.json())
    .then(async (data) => {
        geoData = await data.records;
        navigator.geolocation.getCurrentPosition(successCallback);
    });

function setDiv() {
    console.log(currentPosition)
    let container = document.getElementsByClassName('body-list');
    geoData = geoData.map(data => {
        cordinate1 = {
            lat: currentPosition.coords.latitude,
            lon: currentPosition.coords.longitude,
        }

        cordinate2 = {
            lat: data.fields.geo_shape.coordinates[0],
            lon: data.fields.geo_shape.coordinates[1],
        }
        let distance = getDistanceBetweenTwoPoints(cordinate1, cordinate2)
        data.distance = distance.toFixed(2)
        return { ...data }
    })

    geoData = geoData.sort((a, b) => a.distance - b.distance)

    for (let i = 0; i < geoData.length; i++) {
        let div = document.createElement('div');
        div.classList.add('facility-list');
        div.innerHTML = `
        <div class="facility-list-sub">
          <div>
            <img
              class="facility-image"
              src="https://cdn.pixabay.com/photo/2013/07/13/14/05/location-162102__340.png"
            />
          </div>
          <div class="facility-head">
            <span>${geoData[i].fields.toilet_name}</span>
            <span>${geoData[i].fields.ward} </span>
            <span style="color: blue; font-size: 12px"> ${geoData[i].distance} KM </span>
          </div>
        </div>
        <div class="facility-body">
          <span> Open:${geoData[i].fields.opening} </span>
          <span>${geoData[i].fields.address}</span>
          <span style="color: blue;text-decoration:underline;cursor:pointer;" id=myDiv" > More Information </span>
      </div>`;
        container[0].appendChild(div);

        // myDiv = document.querySelector('#myDiv');
        // myDiv.addEventListener('click', function () {
        //     console.log('The div was clicked!');
        // });
    }
    map = L.map('map').setView([cordinate1.lat, cordinate1.lon], 13);
    marker = L.marker([cordinate1.lat, cordinate1.lon]).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    popup = L.popup()
        .setLatLng([cordinate1.lat, cordinate1.lon])
        .setContent("Current Location")
    marker.bindPopup(popup).openPopup();
    map.on('click', onMapClick);

    for (var i = 0; i < geoData.length; i++) {
        var redIcon = L.icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });
        var marker = L.marker([geoData[i].fields.geo_shape.coordinates[1], geoData[i].fields.geo_shape.coordinates[0]], { icon: redIcon }).addTo(map);
        popup = L.popup()
            .setLatLng([geoData[i].fields.geo_shape.coordinates[1], geoData[i].fields.geo_shape.coordinates[0]])
            .setContent(geoData[i].fields.address)
        marker.bindPopup(popup);
    }

    

}

function getDistanceBetweenTwoPoints(cord1, cord2) {
    if (cord1.lat == cord2.lat && cord1.lon == cord2.lon) {
        return 0;
    }

    const radlat1 = (Math.PI * cord1.lat) / 180;
    const radlat2 = (Math.PI * cord2.lat) / 180;

    const theta = cord1.lon - cord2.lon;
    const radtheta = (Math.PI * theta) / 180;

    let dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    if (dist > 1) {
        dist = 1;
    }

    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344; //convert miles to km
    return dist;
}

