// import { setupMapLibreGl } from "./maplibre-map";
import { setupMapLibreTerrain } from "./maplibre-map-terrain";
import "./style.css";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <div id="map" style="height: 100vh;"></div>
  </div>
`;
const containerMap = document.querySelector<HTMLDivElement>("#map")!;

// setupMapLibreGl(containerMap);

setupMapLibreTerrain(containerMap);
