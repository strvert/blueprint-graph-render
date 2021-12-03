import { fabric } from "fabric";

import { Graph } from "./graph";
import defineNodeObject from "./node";
// import defineGraphObject from "./graph";

defineNodeObject(fabric);
// defineGraphObject(fabric);

fabric.Group.prototype.hasControls = false;
fabric.Group.prototype.hasBorders = false;

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".upper-canvas")
    .addEventListener("contextmenu", (e) => e.preventDefault());
});

const canvas = new fabric.Canvas("c", {
  fireRightClick: true,
  selectionColor: "#00000000",
  perPixelTargetFind: true,
  selectionBorderColor: "white",
  selectionDashArray: [6, 4],
  selection: true,
});
// canvas.setBackgroundColor("#272726");
canvas.setBackgroundColor("#272726");
canvas.setHeight(800);

const updateWidth = () => {
  const wrapperElm = document.querySelector(
    ".canvas-wrapper"
  ) as HTMLDivElement;
  canvas.setWidth(wrapperElm.clientWidth);
  canvas.renderAll();
};

window.addEventListener("resize", () => updateWidth());
updateWidth();

const graph = new Graph(canvas);

graph.addNode(new fabric.Node({ nodeTitle: "Awesome Function 1" }));
graph.addNode(new fabric.Node({ nodeTitle: "Awesome Function 2" }));
graph.addNode(
  new fabric.Node({
    top: 300,
    left: 300,
    nodeColor: "#FF0000",
    nodeTitle: "Awesome Event 1",
  })
);

graph.setZoom(1);
graph.setPosition({ x: 100, y: 100 });
