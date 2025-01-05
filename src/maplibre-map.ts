import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const setupMapLibreGl = (container: HTMLElement) => {
  const map = new maplibregl.Map({
    container,
    style: "https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json",
    center: [139.3024, 35.2598],
    zoom: 10,
  });
};
