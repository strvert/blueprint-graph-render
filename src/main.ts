import { fabric } from "fabric";
import defineNodeObject from "./node";
import defineGridObject from "./grid";

defineNodeObject(fabric);
defineGridObject(fabric);

fabric.Group.prototype.hasControls = false;
fabric.Group.prototype.hasBorders = false;

window.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".upper-canvas")
    .addEventListener("contextmenu", (e) => e.preventDefault());
});

let canvas = new fabric.Canvas("c", {
  fireRightClick: true,
  selectionColor: "#00000000",
  perPixelTargetFind: true,
  selectionBorderColor: "white",
  selectionDashArray: [6, 4],
});
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

const grid = new fabric.Grid({
  width: canvas.width,
  height: canvas.height,
});
canvas.add(grid);

const nodes = [];
nodes.push(new fabric.Node({ nodeTitle: "Awesome Function 1" }));
nodes.push(new fabric.Node({ nodeTitle: "Awesome Function 2" }));
nodes.push(
  new fabric.Node({
    nodeColor: "#FF0000",
    nodeTitle: "Awesome Event 1",
  })
);

for (const node of nodes) {
  canvas.add(node);
}

let panning = false;
let prevPos = { x: 0, y: 0 };
canvas.on("mouse:down", (e: fabric.IEvent<MouseEvent>) => {
  if (e.button === 3) {
    prevPos = e.absolutePointer;
    panning = true;
  }
});

canvas.on("mouse:move", (e: fabric.IEvent<MouseEvent>) => {
  if (panning) {
    const dx = e.absolutePointer.x - prevPos.x;
    const dy = e.absolutePointer.y - prevPos.y;
    for (const node of nodes) {
      const nodePos = node.getCoords();
      node.top += dy;
      node.left += dx;
      node.setCoords();
    }

    grid.top += dy;
    grid.left += dx;
    if (grid.top >= 0 || grid.top <= -grid.span * 8 * 2) {
      grid.top = -(grid.span * 8);
    }
    if (grid.left >= 0 || grid.left <= -grid.span * 8 * 2) {
      grid.left = -(grid.span * 8);
    }
    grid.setCoords();

    canvas.renderAll();
    prevPos = e.absolutePointer;
  }
});

canvas.on("mouse:up", (e: fabric.IEvent<MouseEvent>) => {
  if (e.button === 3) {
    panning = false;
  }
});
