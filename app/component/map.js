"use client";
import { useEffect, useRef } from "react";
import MapView from "@arcgis/core/views/MapView";
import Map from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import OpenStreetMapLayer from "@arcgis/core/layers/OpenStreetMapLayer";
import LayerList from "@arcgis/core/widgets/LayerList.js";
import shp from "shpjs";
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer";

export default function ArcGISMap() {
  const mapDiv = useRef(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    const osmBasemap = new Basemap({
      baseLayers: [new OpenStreetMapLayer()],
      title: "OpenStreetMap",
      id: "osm",
    });

    const map = new Map({
      basemap: osmBasemap,
    });

    const view = new MapView({
      container: mapDiv.current,
      map: map,
      center: [117, -2], // Centered on Indonesia
      zoom: 4,
    });

    const layerList = new LayerList({
      view: view,
    });

    const addShapefile = async (zipPath, title) => {
      const buffer = await fetch(zipPath).then((r) => r.arrayBuffer());
      const geojson = await shp(buffer);
      const blob = new Blob([JSON.stringify(geojson)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const layer = new GeoJSONLayer({
        url,
        title,
      });
      map.add(layer);
    };

    // Add both shapefiles
    addShapefile("/fc9ca857602a3e81be641732208482.zip", "Kalimantan Utara");
    addShapefile("/8fb973b6e9b0266ee95a1732208436.zip", "Maluku Utara");

    // Adds widget below other elements in the top left corner of the view
    view.ui.add(layerList, {
      position: "top-left",
    });

    return () => view.destroy();
  }, []);

  return <div ref={mapDiv} style={{ height: "100vh", width: "100%" }} />;
}
