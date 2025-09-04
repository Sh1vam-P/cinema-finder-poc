import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, useMap } from "react-map-gl";
// eslint-disable-next-line import/no-webpack-loader-syntax
import maplibregl from "maplibre-gl";
import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { MapContextProvider } from "./context";
import { totalBounds } from "../../data/bounds";
import maplibreglWorker from "maplibre-gl/dist/maplibre-gl-csp-worker";

maplibregl.workerClass = maplibreglWorker;

// Marker component
const MaplibreMarker = ({ lat, lon }) => (
  <Marker longitude={lon} latitude={lat} anchor="bottom" />
);

// Convert [w, s, e, n] to MapLibre bounds [[swLng, swLat], [neLng, neLat]]
const convertBounds = ([w, s, e, n]) => [
  [w, s], // southwest
  [e, n], // northeast
];

// Event listener for snapping/flying to a coordinate
const MapSnappingEventListener = () => {
  const { enqueueSnackbar } = useSnackbar();
  const mapRef = useMap(); // ref to the map

  useEffect(() => {
    const handleSnap = ({ detail: { lat, lng } }) => {
      try {
        if (!mapRef.current) return;
        mapRef.current.flyTo({
          center: [lng, lat], // MapLibre expects [lng, lat]
          zoom: 14,
        });
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Unexpected error while attempting map navigation", {
          variant: "error",
        });
      }
    };

    window.addEventListener("map.snapTo", handleSnap);
    return () => window.removeEventListener("map.snapTo", handleSnap);
  }, [mapRef, enqueueSnackbar]);

  return null;
};

const MaplibreMap = ({ children }) => {
  console.log("render Maplibre map");

  return (
    <Map
      mapLib={maplibregl}
      mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=46DCXvzkGNIvqAgCljGV"
      initialViewState={{
        longitude: 0,
        latitude: 0,
        zoom: 2,
      }}
      style={{ width: "100%", height: "100%" }}
      onLoad={(evt) => {
        // Fit the map to the total bounds on load
        const map = evt.target;
        map.fitBounds(convertBounds(totalBounds), { padding: 24 });
      }}
    >
      <MapSnappingEventListener />
      <MapContextProvider value={{ Marker: MaplibreMarker }}>
        {children}
      </MapContextProvider>
    </Map>
  );
};

export default MaplibreMap;
