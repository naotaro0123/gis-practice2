import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";

export const setupMapLibreTerrain = (container: HTMLElement) => {
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
        "aws-terriain": {
          type: "raster-dem",
          minzoom: 1,
          maxzoom: 15,
          encoding: "terrarium",
          tiles: [
            "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
          ],
          attribution:
            // see 'https://github.com/tilezen/joerd/blob/master/docs/attribution.md'
            "\
          ArcticDEM terrain data DEM(s) were created from DigitalGlobe, Inc., imagery and funded under National Science Foundation awards 1043681, 1559691, and 1542736; \
          Australia terrain data © Commonwealth of Australia (Geoscience Australia) 2017;\
          Austria terrain data © offene Daten Österreichs – Digitales Geländemodell (DGM) Österreich;\
          Canada terrain data contains information licensed under the Open Government Licence – Canada;\
          Europe terrain data produced using Copernicus data and information funded by the European Union - EU-DEM layers;\
          Global ETOPO1 terrain data U.S. National Oceanic and Atmospheric Administration\
          Mexico terrain data source: INEGI, Continental relief, 2016;\
          New Zealand terrain data Copyright 2011 Crown copyright (c) Land Information New Zealand and the New Zealand Government (All rights reserved);\
          Norway terrain data © Kartverket;\
          United Kingdom terrain data © Environment Agency copyright and/or database right 2015. All rights reserved;\
          United States 3DEP (formerly NED) and global GMTED2010 and SRTM terrain data courtesy of the U.S. Geological Survey.",
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
        // 陰影起伏
        {
          id: "hills",
          type: "hillshade",
          source: "aws-terriain",
        },
      ],
      terrain: {
        source: "aws-terriain",
        exaggeration: 1,
      },
    },
  });
};
