import { MapboxOverlay } from "@deck.gl/mapbox";
import { Tiles3DLoader } from "@loaders.gl/3d-tiles";
import { Tile3DLayer } from "deck.gl";
import "mapbox-gl/dist/mapbox-gl.css";
import mlcontour from "maplibre-contour";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";
import "./maplibre-map-layer.css";

type Layer = { id: string; labelName: string };
const layers: Layer[] = [
  { id: "background-osm-raster", labelName: "OpenStreetMap" },
  { id: "hills", labelName: "陰影起伏" },
  { id: "bldg-tokyo", labelName: "PLATEAU 東京都23区建物データ" },
  { id: "bldg-yokohama", labelName: "PLATEAU 横浜建物データ" },
  {
    id: "amx-a-fude-polygon",
    labelName: "登記所備付地図データ 間引きなし（ポリゴン）",
  },
  {
    id: "amx-a-fude-line",
    labelName: "登記所備付地図データ 間引きなし（ライン）",
  },
  { id: "amx-a-daihyo", labelName: "登記所備付地図データ 代表点レイヤ" },
];

const createLayerElements = (container: HTMLElement, map: maplibregl.Map) => {
  const layerControls = document.createElement("div");
  layerControls.id = "layerControl";
  layerControls.style.position = "absolute";
  layerControls.style.top = "0";
  layerControls.style.right = "0";

  // ADD LAYER
  {
    const header = document.createElement("h3");
    header.textContent = "レイヤ";
    layerControls.appendChild(header);

    for (const layer of layers) {
      const checkboxContainer = document.createElement("div");
      checkboxContainer.classList.add("checkbox-container");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = layer.id;
      checkbox.classList.add("checkbox");
      checkbox.checked = true;
      checkbox.addEventListener("change", () => {
        const display = checkbox.checked ? "visible" : "none";
        map.setLayoutProperty(checkbox.id, "visibility", display);
      });
      checkboxContainer.appendChild(checkbox);
      const label = document.createElement("label");
      label.htmlFor = layer.id;
      label.textContent = layer.labelName;
      checkboxContainer.appendChild(label);
      layerControls.appendChild(checkboxContainer);
    }
    container.appendChild(layerControls);
  }
};

const createDeckGlMapBoxOverlay = (): MapboxOverlay => {
  const tile3dLayer = new MapboxOverlay({
    id: "yokohama-3d-tile-layer", // これは使わないので適当で良い
    interleaved: true,
    layers: [
      new Tile3DLayer({
        id: "bldg-yokohama",
        type: Tile3DLayer,
        data: "https://plateau.geospatial.jp/main/data/3d-tiles/bldg/14100_yokohama/low_resolution/tileset.json",
        loader: Tiles3DLoader,
        onTilesetLoad: (tileset) => {
          // addControls後にこのイベントが走る
          console.log("tileset", tileset);
        },
      }),
    ],
  });
  return tile3dLayer;
};

const demSource = new mlcontour.DemSource({
  url: "https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png",
  encoding: "mapbox",
  maxzoom: 12,
  // offload contour line computation to a web worker
  worker: true,
});
demSource.setupMaplibre(maplibregl);

export const setupMapLayer = (container: HTMLElement) => {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);

  const map = new maplibregl.Map({
    container,
    center: [139.4894, 35.339], // 藤沢の緯度経度だと標高のラインが404エラーになる
    // center: [11.3229, 47.2738],
    maxPitch: 80,
    zoom: 16,
    style: {
      version: 8,
      // FIXME: 以下のサイトのコードをそのままコピーしただけでは404エラーになる
      // https://maplibre.org/maplibre-gl-js/docs/examples/contour-lines/
      glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
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
        // 地形データ
        "aws-terrain": {
          type: "raster-dem",
          // タイルが利用可能な最小ズームレベル
          minzoom: 1,
          // タイルが利用可能な最大ズームレベル
          maxzoom: 15,
          // このソースが使用するエンコーディング。terrarium（Terrarium形式のPNGタイル）、mapbox（Mapbox Terrain RGBタイル）、custom のいずれか
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
        // 登記所備付地図
        "amx-a-pmtiles": {
          type: "vector",
          // タイルが利用可能な最小ズームレベル
          minzoom: 2,
          // タイルが利用可能な最大ズームレベル
          maxzoom: 16,
          // リソースへのURL
          url: "pmtiles://https://habs.rad.naro.go.jp/spatial_data/amx/a.pmtiles",
          attribution:
            "<a href='https://www.moj.go.jp/MINJI/minji05_00494.html' target='_blank'>登記所備付地図データ（法務省）</a>",
        },
        // 3D都市モデル（Project PLATEAU）東京都23区（2020年度）建物データ
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
        // 標高タイルで等高線を描画する
        hillshadeSource: {
          type: "raster-dem",
          // share cached raster-dem tiles with the contour source
          tiles: [demSource.sharedDemProtocolUrl],
          tileSize: 512,
          maxzoom: 12,
        },
        contourSourceFeet: {
          type: "vector",
          tiles: [
            demSource.contourProtocolUrl({
              // meters to feet
              multiplier: 3.28084,
              overzoom: 1,
              thresholds: {
                // zoom: [minor, major]
                // 11: [200, 1000],
                // 12: [100, 500],
                // 13: [100, 500],
                // 14: [50, 200],
                // 15: [20, 100],
              },
              elevationKey: "ele",
              levelKey: "level",
              contourLayer: "contours",
            }),
          ],
          maxzoom: 15,
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
          source: "aws-terrain",
        },
        // 登記所備付地図データ 間引きなし
        {
          id: "amx-a-fude-polygon",
          // 塗りつぶされたポリゴン
          type: "fill",
          source: "amx-a-pmtiles",
          // ベクトルタイルソースから使用するレイヤ
          "source-layer": "fude",
          paint: {
            // 塗りつぶし部分の色
            "fill-color": "rgba(254, 217, 192, 1)",
            // 塗りつぶしの輪郭の色
            "fill-outline-color": "rgba(255, 0, 0, 1)",
            // 塗りつぶしの不透明度 1に近づくほど不透明になる
            "fill-opacity": 0.4,
          },
        },
        // 登記所備付地図データ 間引きなし
        // NOTE: 3D Terrainを表示すると、fill-outline-colorが効かない不具合が起きる
        // そのため、lineレイヤを追加する
        {
          id: "amx-a-fude-line",
          // 塗りつぶされたポリゴン
          type: "line",
          source: "amx-a-pmtiles",
          // ベクトルタイルソースから使用するレイヤ
          "source-layer": "fude",
          paint: {
            "line-color": "rgba(255, 0, 0, 1)",
            "line-width": 0.1,
          },
        },
        // 登記所備付地図データ 代表点レイヤ
        {
          id: "amx-a-daihyo",
          // ヒートマップ
          type: "heatmap",
          source: "amx-a-pmtiles",
          // ベクトルタイルソースから使用するレイヤ
          "source-layer": "daihyo",
          paint: {
            // ヒートマップの密度に基づいて各ピクセルの色を定義
            "heatmap-color": [
              // 入力値と出力値のペア（"stop"）の間を補間することにより、連続的で滑らかな結果を生成する
              "interpolate",
              // 入力より小さいストップと大きいストップのペアを直線的に補間
              ["linear"],
              // ヒートマップレイヤーの密度推定値を取得
              ["heatmap-density"],
              0,
              "rgba(255, 255, 255, 0)",
              0.5,
              "rgba(255, 255, 0, 0.5)",
              // 1に近づくほど密度が高い
              1,
              "rgba(255, 0, 0, 0.5)",
            ],
            // ヒートマップ1点の半径（ピクセル単位）
            "heatmap-radius": [
              // 入力値と出力値のペア（"stop"）の間を補間することにより、連続的で滑らかな結果を生成する
              "interpolate",
              // 出力が増加する割合を制御する、1に近づくほど出力が増加する
              ["exponential", 10],
              // ズームレベルに応じて半径を調整する
              ["zoom"],
              2,
              5,
              14,
              50,
            ],
          },
        },
        {
          id: "bldg-tokyo",
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
        {
          id: "hillshadeSource",
          type: "hillshade",
          source: "hillshadeSource",
          layout: { visibility: "visible" },
          paint: { "hillshade-exaggeration": 0.25 },
        },
        {
          id: "contours",
          type: "line",
          source: "contourSourceFeet",
          "source-layer": "contours",
          paint: {
            "line-opacity": 0.5,
            // "major" contours have level=1, "minor" have level=0
            "line-width": ["match", ["get", "level"], 1, 1, 0.5],
          },
        },
        {
          id: "contour-text",
          type: "symbol",
          source: "contourSourceFeet",
          "source-layer": "contours",
          filter: [">", ["get", "level"], 0],
          paint: {
            "text-halo-color": "white",
            "text-halo-width": 1,
          },
          layout: {
            "symbol-placement": "line",
            "text-size": 10,
            "text-field": [
              "concat",
              ["number-format", ["get", "ele"], {}],
              "'",
            ],
            "text-font": ["Noto Sans Bold"],
          },
        },
      ],
      // 地形
      terrain: {
        // 地形データのソース
        source: "aws-terrain",
        // 標高の誇張度
        exaggeration: 1,
      },
      sky: {
        // 空のベースカラー
        "sky-color": "#199EF3",
        // 空の色と水平線の色の混ぜ合わせ。1は空の真ん中の色を、0は空の色を使用する
        "sky-horizon-blend": 0.5,
        // 地平線のベースカラー
        "horizon-color": "#ffffff",
        // 霧の色と水平線の色の混ぜ合わせ。0は水平線の色、1は霧の色を使用する
        "horizon-fog-blend": 0.5,
        // 霧のベースカラー。 3D地形が必要
        "fog-color": "#0000ff",
        // 3D地形に霧を混ぜ合わせる。 0はマップの中心、1は地平線
        "fog-ground-blend": 0.5,
        // 大気の混ぜ合わせ。 1が可視大気、0が非表示大気
        "atmosphere-blend": [
          "interpolate",
          ["linear"],
          ["zoom"],
          0,
          1,
          10,
          1,
          12,
          0,
        ],
      },
    },
  });

  // LayerのElementを生成する
  createLayerElements(container, map);

  // deck.MapboxOverlayを生成する
  map.once("load", () => {
    const tile3dLayer = createDeckGlMapBoxOverlay();
    map.addControl(tile3dLayer);
  });
};
