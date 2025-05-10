// import { setupMapLibreGl } from "./maplibre-map";
// import { setupMapLibreTerrain } from "./maplibre-map-terrain";
// import { setupMapLibrePlateau } from "./maplibre-map-plateau";
// import { setupMapLayer } from "./maplibre-map-layer";
import { setupMapLayer } from "./maplibre-hiking-map-layer";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="map" style="height: 100vh;"></div>
  </div>
`;
const containerMap = document.querySelector<HTMLDivElement>("#map")!;

// setupMapLibreGl(containerMap);

// setupMapLibreTerrain(containerMap);

// setupMapLibrePlateau(containerMap);

setupMapLayer(containerMap);
