"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import shp from "shpjs"; // convert shapefile zip -> GeoJSON
import "maplibre-gl/dist/maplibre-gl.css";

const shapefiles = [
  {
    id: "Kalimantan Utara",
    url: "/fc9ca857602a3e81be641732208482.zip",
    color: "#e63946",
  },
  {
    id: "Maluku Utara",
    url: "/8fb973b6e9b0266ee95a1732208436.zip",
    color: "#457b9d",
  },
  {
    id: "Jawa Barat",
    url: "/3fd8c11d66a4840ca1c91732208389.zip",
    color: "#2a9d8f",
  },
  {
    id: "Banten",
    url: "/c09bfc92200ae2ee3c861732208337.zip",
    color: "#f4a261",
  },
  {
    id: "Aceh",
    url: "/942e12ba100e034bba631732208299.zip",
    color: "#e76f51",
  },
  {
    id: "Papua",
    url: "/d2d57bbeb6972995be761732208257.zip",
    color: "#a8dadc",
  },
  {
    id: "Kalimantan Selatan",
    url: "/278b924e2bc217bbea041732208219.zip",
    color: "#a8dadc",
  },
  {
    id: "Papua Barat",
    url: "/3ff0cb447f3fc57cb11f1732208146.zip",
    color: "#a8dadc",
  },
  {
    id: "Jawa Barat 2",
    url: "/aa2262f6b7e9e20561431732208096.zip",
    color: "#2a9d8f",
  },
  {
    id: "Sulawesi Tenggara",
    url: "/9a58d8fd372cc57e752b1732207849.zip",
    color: "#e76f51",
  },
  {
    id: "Riau",
    url: "/75fcbbb50eceaf9f23c71732207685.zip",
    color: "#f4a261",
  },
  {
    id: "Sumatera Selatan",
    url: "/ed49adf8d4548af1a42b1732207624.zip",
    color: "#e63946",
  },
  {
    id: "Sumatera Utara",
    url: "/2f05a7c6b3cd130317631732207555.zip",
    color: "#457b9d",
  },
  {
    id: "Sulawesi Selatan",
    url: "/57e66a41c16029e935921732207472.zip",
    color: "#2a9d8f",
  },
  {
    id: "Jawa Timur",
    url: "/a0d0fd8acb402925d43e1732207401.zip",
    color: "#f4a261",
  },
  {
    id: "Sulawesi Utara",
    url: "/bfd616608deabf4b2a271732207184.zip",
    color: "#e76f51",
  },
  {
    id: "Lampung",
    url: "/f0c8297989ed574a77c61732207042.zip",
    color: "#a8dadc",
  },
  {
    id: "Kepulauan Riau",
    url: "/26962b47325a07e6c84e1732206809.zip",
    color: "#e63946",
  },
  {
    id: "Kalimantan Timur",
    url: "/71bd147e74abfbb4fc571732206738.zip",
    color: "#457b9d",
  },
  {
    id: "Kalimantan Barat",
    url: "/8f4ccb8abb7ca2b646b01732206552.zip",
    color: "#2a9d8f",
  },
  {
    id: "Kawasan Industri",
    url: "/195cf82c220e46c5ddd71724972140.zip",
    color: "#f4a261",
  },
  {
    id: "Kawasan Industri Cikembar",
    url: "/9c552de64513cd565a061753233168.zip",
    color: "#e76f51",
  },
];

export default function MapPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [visibleLayers, setVisibleLayers] = useState(() => {
    // Initialize all layers as not visible
    const initial = {};
    shapefiles.forEach((file) => {
      initial[file.id] = false;
    });
    return initial;
  });
  const [loadedLayers, setLoadedLayers] = useState({});

  useEffect(() => {
    if (mapRef.current) return; // init only once

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "/osm.json", // OSM style
      center: [117, -2],
      zoom: 4,
    });

    mapRef.current = map;
  }, []);

  // Toggle layer visibility with lazy loading
  const toggleLayer = async (layerId) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const newVisible = !visibleLayers[layerId];

    // If turning on and layer not loaded yet, load it first
    if (newVisible && !loadedLayers[layerId]) {
      const file = shapefiles.find((f) => f.id === layerId);
      if (!file) return;

      try {
        // Load and convert shapefile
        const geojson = await shp(file.url);

        // Add as source
        map.addSource(layerId, {
          type: "geojson",
          data: geojson,
        });

        // Add as fill layer
        map.addLayer({
          id: layerId,
          type: "fill",
          source: layerId,
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-color": file.color,
            "fill-opacity": 0.6,
          },
        });

        // Add outline
        map.addLayer({
          id: layerId + "-outline",
          type: "line",
          source: layerId,
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "#000",
            "line-width": 1,
          },
        });

        // Mark as loaded
        setLoadedLayers((prev) => ({
          ...prev,
          [layerId]: true,
        }));

        // Update visibility state
        setVisibleLayers((prev) => ({
          ...prev,
          [layerId]: true,
        }));
      } catch (err) {
        console.error("Error loading shapefile", layerId, err);
      }
    } else if (loadedLayers[layerId]) {
      // Layer already loaded, just toggle visibility
      map.setLayoutProperty(
        layerId,
        "visibility",
        newVisible ? "visible" : "none"
      );
      map.setLayoutProperty(
        layerId + "-outline",
        "visibility",
        newVisible ? "visible" : "none"
      );

      setVisibleLayers((prev) => ({
        ...prev,
        [layerId]: newVisible,
      }));
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "100vh", position: "relative" }}
      >
        <div
          style={{ padding: "10px" }}
          className="absolute bg-white rounded-[16px] z-100 m-8"
        >
          <h3>Layer List</h3>
          {shapefiles.map((file) => (
            <div key={file.id}>
              <label>
                <input
                  type="checkbox"
                  checked={!!visibleLayers[file.id]}
                  onChange={() => toggleLayer(file.id)}
                />
                {file.id}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
