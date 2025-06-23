from flask import Flask, request, jsonify
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

app = Flask(__name__, static_folder="static", static_url_path="")

# ————— Configuración de geocoding —————
geolocator = Nominatim(user_agent="mapa_clientes_app")
geocode = RateLimiter(
    geolocator.geocode,
    min_delay_seconds=1,
    max_retries=3,
    error_wait_seconds=2.0
)

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/geocode", methods=["POST"])
def do_geocode():
    data = request.get_json(force=True)
    addresses = data.get("addresses", [])[:50]  # limitar a 50 para evitar timeouts
    results = []

    for addr in addresses:
        # Separar componentes de la dirección
        parts = [p.strip() for p in addr.split(",")]
        street = parts[0]
        city   = parts[1] if len(parts) > 1 else ""
        state  = parts[2] if len(parts) > 2 else ""

        # Intento libre con toda la cadena
        location = geocode(f"{addr}, Argentina")

        # Fallback estructurado
        if not location:
            try:
                location = geolocator.geocode(
                    {'street': street, 'city': city, 'state': state, 'country': 'Argentina'},
                    timeout=10
                )
            except Exception:
                location = None

        if location:
            addr_info = location.raw.get("address", {})
            results.append({
                "address":  addr,
                "lat":      location.latitude,
                "lng":      location.longitude,
                "province": addr_info.get("state", ""),
                "city":     addr_info.get("city") or addr_info.get("town") or ""
            })
        else:
            results.append({ "address": addr, "error": "No encontrado" })

    return jsonify(results)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)