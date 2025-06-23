// script.js

// 0) Verificamos que el archivo carga
console.log("script.js cargado");

// 1) Inicializamos el mapa centrado en Argentina
const map = L.map('map').setView([-34.5, -58.4], 5);
console.log("Mapa inicializado");

// 2) Añadimos los mosaicos de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 3) Lista de direcciones de ejemplo (luego vendrá de un formulario o base de datos)
const addresses = [
  "Av. Corrientes 500, Buenos Aires, Buenos Aires",
  "Calle Florida 200, Buenos Aires, Buenos Aires",
  "Av. 9 de Julio 1500, Buenos Aires, Buenos Aires",
  "Calle San Martín 320, Mendoza, Mendoza",
  "Boulevard Oroño 1200, Rosario, Santa Fe",
  "Av. Rivadavia 1000, La Plata, Buenos Aires",
  "Calle Maipú 450, Córdoba, Córdoba",
  "Av. Belgrano 800, Salta, Salta",
  "Calle Perú 300, San Miguel de Tucumán, Tucumán",
  "Av. San Martín 2200, Neuquén, Neuquén",
  "Calle Güemes 110, Mar del Plata, Buenos Aires",
  "Av. Pellegrini 1750, Rosario, Santa Fe",
  "Calle Urquiza 600, Corrientes, Corrientes",
  "Av. España 950, Paraná, Entre Ríos",
  "Calle Rivadavia 250, Santa Fe, Santa Fe",
  "Av. Alem 1100, Formosa, Formosa",
  "Calle Belgrano 410, Posadas, Misiones",
  "Av. Libertador 2000, San Isidro, Buenos Aires",
  "Calle Colón 100, Salta, Salta",
  "Av. Jorge Newbery 300, Ushuaia, Tierra del Fuego",
  "Calle España 520, Bariloche, Río Negro",
  "Av. Hipólito Yrigoyen 850, Bahía Blanca, Buenos Aires",
  "Calle Dorrego 700, Santa Rosa, La Pampa",
  "Av. Luro 420, Mar del Plata, Buenos Aires",
  "Calle San Luis 320, San Juan, San Juan",
  "Av. General Paz 1400, Ciudadela, Buenos Aires",
  "Calle Sarmiento 230, La Rioja, La Rioja",
  "Av. Colón 1800, Mendoza, Mendoza",
  "Calle Mitre 550, Trelew, Chubut",
  "Av. Güemes 900, Resistencia, Chaco"
];


// 4) Enviamos esas direcciones a nuestro endpoint Flask /geocode
console.log("Enviando direcciones a /geocode…", addresses);
fetch('/geocode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ addresses })
})
  .then(res => {
    console.log("Respuesta recibida:", res.status);
    return res.json();
  })
  .then(data => {
    console.log("Datos recibidos de /geocode:", data);

    // 4a) Marcador de prueba con la primera ubicación
    if (data[0] && data[0].lat) {
      L.marker([data[0].lat, data[0].lng])
        .addTo(map)
        .bindPopup("Marcador de prueba: " + data[0].address)
        .openPopup();
      console.log("Marcador de prueba añadido");
    }

    // 5) Creamos el grupo de clusters
    const markers = L.markerClusterGroup();

    // 6) Para cada resultado, creamos un marcador y lo añadimos al cluster
    data.forEach(item => {
      if (item.error) {
        console.warn("No se encontró:", item.address);
        return;
      }
      const marker = L.marker([item.lat, item.lng])
        .bindPopup(`<b>${item.address}</b><br>${item.city}, ${item.province}`);
      markers.addLayer(marker);
    });

    // 7) Añadimos el cluster al mapa
    map.addLayer(markers);
    console.log(" Cluster agregado con todos los marcadores");
  })
  .catch(err => {
    console.error(" Error en fetch o en el procesamiento:", err);
  });
