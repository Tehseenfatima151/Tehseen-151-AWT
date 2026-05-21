import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons in React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [31.5204, 74.3587]; // Lahore default coords

function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position}></Marker>;
}

const MapSelector = ({ onLocationChange }) => {
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Initial trigger for default center
  useEffect(() => {
    handleLocationSelect({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLocationSelect = async (latlng) => {
    setLoadingAddress(true);
    try {
      // Free reverse geocoding via standard nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
      const data = await res.json();
      
      const parsedCity = data.address?.city || data.address?.town || data.address?.state || "";
      const parsedStreet = data.address?.road || data.address?.neighbourhood || data.address?.suburb || "";
      
      const details = {
        lat: latlng.lat,
        lng: latlng.lng,
        fullAddress: data.display_name || "",
        city: parsedCity,
        street: parsedStreet,
        zip: data.address?.postcode || ""
      };
      
      onLocationChange(details);
    } catch (err) {
      console.error("Geocoding failed", err);
      // Fallback to just coordinates if fetch fails
      onLocationChange({ lat: latlng.lat, lng: latlng.lng, city: "", street: "", zip: "", fullAddress: "" });
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div className="w-full h-64 sm:h-72 rounded-xl overflow-hidden shadow-inner border border-gray-200 relative z-0">
      <MapContainer center={DEFAULT_CENTER} zoom={13} scrollWheelZoom={true} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={handleLocationSelect} />
      </MapContainer>
      
      {loadingAddress && (
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-bold text-gray-700 z-[400] flex items-center gap-2 border border-gray-100">
          <i className="fa-solid fa-circle-notch fa-spin text-[var(--color-brand)] text-sm"></i> Fetching address...
        </div>
      )}
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center z-[400] pointer-events-none">
         <span className="bg-gray-900/85 text-white px-5 py-2.5 rounded-full text-xs font-bold backdrop-blur-md shadow-lg tracking-wide border border-white/10">
           Tap anywhere on the map to pin your location
         </span>
      </div>
    </div>
  );
};

export default MapSelector;
