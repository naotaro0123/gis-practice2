import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";

export const setupMapLibrePlateau = (container: HTMLElement) => {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);

  const map = new maplibregl.Map({
    container,
    center: [139.4894, 35.339],
    zoom: 16,
    style: {
      version: 8,
      sources: {
        "background-osm-raster": {
          // ソースの種類。vector、raster、raster-dem、geojson、image、video のいずれか
          type: "raster",
          // タイルソースのURL
          tiles: [
            "https://tile.openstreetmap.jp/styles/osm-bright-ja/{z}/{x}/{y}.png",
          ],
          // タイルの解像度。単位はピクセル、デフォルトは512
          tileSize: 256,
          // データの帰属
          attribution:
            "<a href='https://www.openstreetmap.org/copyright' target='_blank'>© OpenStreetMap contributors</a>",
        },
        "plateau-bldg": {
          type: "vector",
          tiles: [
            "https://indigo-lab.github.io/plateau-lod2-mvt/{z}/{x}/{y}.pbf",
          ],
          minzoom: 10,
          maxzoom: 16,
          attribution:
            "<a href='https://github.com/indigo-lab/plateau-lod2-mvt'>plateau-lod2-mvt by indigo-lab</a> (<a href='https://www.mlit.go.jp/plateau/'>国土交通省 Project PLATEAU</a> のデータを加工して作成)",
        },
      },
      layers: [
        // 背景地図としてOpenStreetMapのラスタタイルを追加
        {
          // 一意のレイヤID
          id: "background-osm-raster",
          // レイヤの種類。background、fill、line、symbol、raster、circle、fill-extrusion、heatmap、hillshade のいずれか
          type: "raster",
          // データソースの指定
          source: "background-osm-raster",
        },
        {
          id: "bldg",
          type: "fill-extrusion",
          source: "plateau-bldg",
          // ベクタタイルソースから使用するレイヤ
          "source-layer": "bldg",
          paint: {
            // 高さ
            "fill-extrusion-height": ["*", ["get", "z"], 1],
            // 塗りつぶしの色
            "fill-extrusion-color": "#797979",
            // 透明度
            "fill-extrusion-opacity": 0.7,
          },
        },
      ],
    },
  });
};
