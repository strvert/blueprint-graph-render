import { fabric } from "fabric";
import defineNodeObject from "./node";
import defineGridObject from "./grid";

defineNodeObject(fabric);
defineGridObject(fabric);

export class Graph {
  public canvas: fabric.Canvas;
  private nodes: any[];
  private background: any; // grid
  private gridSpan: number;
  private zoomLevel: number;
  private position: { x: number; y: number };

  private panning: boolean;
  private prevPos: { x: number; y: number };

  constructor(canvas: fabric.Canvas) {
    this.canvas = canvas;
    this.gridSpan = 16;
    this.zoomLevel = 1;
    this.position = { x: 0, y: 0 };
    this.background = new fabric.Grid();
    this.canvas.add(this.background);

    this.nodes = [];
    this.panning = false;
    this.prevPos = { x: 0, y: 0 };
    this.initEvents();

    this.updateInnerCanvasSize();
    this.updateNodeControls();

    const observer = new MutationObserver(() => {
      this.updateInnerCanvasSize();
      this.updateNodeControls();
    });
    observer.observe(this.canvas.getSelectionElement(), { attributes: true });
  }

  private initEvents() {
    this.canvas.on("mouse:down", (e: fabric.IEvent<MouseEvent>) => {
      if (e.button === 3) {
        this.prevPos = e.absolutePointer;
        this.panning = true;
      }
    });

    this.canvas.on("mouse:move", (e: fabric.IEvent<MouseEvent>) => {
      // console.log(this.background.left, this.background.top);
      if (this.panning) {
        const dx = e.absolutePointer.x - this.prevPos.x;
        const dy = e.absolutePointer.y - this.prevPos.y;
        this.movePosition({ x: dx, y: dy });
        this.canvas.renderAll();
        this.prevPos = e.absolutePointer;
      }
    });

    this.canvas.on("mouse:up", (e: fabric.IEvent<MouseEvent>) => {
      if (e.button === 3) {
        this.panning = false;
      }
    });

    this.canvas.on("mouse:wheel", (e: fabric.IEvent<MouseEvent>) => {
      const d = e.e.deltaY;
      const zoom = this.canvas.getZoom() * 0.999 ** d;
      // this.setZoom(zoom);
      if (zoom <= 2 && zoom >= 0.5) {
        this.zoomToPoint(zoom, {
          x: e.e.offsetX,
          y: e.e.offsetY,
        });
      }
    });
  }

  private moveNodes(offset: { x: number; y: number }) {
    for (const node of this.nodes) {
      node.top += offset.y;
      node.left += offset.x;
      node.setCoords();
    }
  }

  private updateInnerCanvasSize() {
    this.background.width =
      (Math.ceil(
        ((1 + (1 - this.zoomLevel) / this.zoomLevel) * this.canvas.getWidth()) /
          this.gridSpan /
          8
      ) +
        2) *
      this.gridSpan *
      8;
    this.background.height =
      (Math.ceil(
        ((1 + (1 - this.zoomLevel) / this.zoomLevel) *
          this.canvas.getHeight()) /
          this.gridSpan /
          8
      ) +
        2) *
      this.gridSpan *
      8;

    this.background.setCoords();
  }

  private updateNodeControls() {
    for (const node of this.nodes) {
      node.borderScaleFactor = this.zoomLevel * 4;
    }
  }

  private moveBackground(point: { x: number; y: number }) {
    const p = this.background.getCoords()[0];
    console.log(this.background.left, this.background.top);
    this.background.top += point.y;
    this.background.left += point.x;
    if (
      this.background.top >= 0 ||
      this.background.top <= -this.background.span * 8 * 2
    ) {
      this.background.top = -(this.background.span * 8 + p.y);
    }
    if (
      this.background.left >= 0 ||
      this.background.left <= -this.background.span * 8 * 2
    ) {
      this.background.left = -(this.background.span * 8 + p.x);
    }
    this.background.setCoords();
  }

  setPosition(position: { x: number; y: number }) {
    const dx = position.x - this.position.x;
    const dy = position.y - this.position.y;
    this.moveNodes({ x: dx, y: dy });
    this.moveBackground({ x: dx, y: dy });
    // for (const node of this.nodes) {
    //   node.top -= position.y;
    //   node.left -= position.x;
    //   node.setCoords();
    // }
    // this.background.top -= position.y;
    // this.background.left -= position.x;
    this.canvas.renderAll();
    this.position = position;
  }

  movePosition(offset: { x: number; y: number }) {
    const nx = this.position.x + offset.x;
    const ny = this.position.y + offset.y;
    this.setPosition({ x: nx, y: ny });
    // this.moveNodes(offset.x, offset.y);
    // this.moveBackground(offset.x, offset.y);
  }

  translateToGraphCoords(point: { x: number; y: number }) {
    return { x: this.position.x + point.x, y: this.position.y + point.y };
  }

  addNode(node: any) {
    this.nodes.push(node);
    this.canvas.add(node);
  }

  zoomToPoint(level: number, offsetPoint: { x: number; y: number }) {
    this.zoomLevel = level;
    // const baseX = this.position.x + offsetPoint.x / level;
    // const baseY = this.position.y + offsetPoint.y / level;
    this.canvas.zoomToPoint(offsetPoint, level);
    const calcOffset = (v: number) => {
      return -(level - 1) * v;
    };
    // this.movePosition({
    //   x: (1 + (1 - level) / level) * calcOffset(offsetPoint.x),
    //   y: (1 + (1 - level) / level) * calcOffset(offsetPoint.y),
    // });
    // this.canvas.renderAll();
    this.updateInnerCanvasSize();
    // this.background.left = 0;
    // this.background.top = 0;
    // this.background.viewportCenter();
    // this.background.setCoords();
    this.canvas.renderAll();
  }

  setZoom(level: number) {
    this.zoomLevel = level;
    this.canvas.setZoom(level);
    this.updateInnerCanvasSize();
    this.canvas.renderAll();
  }
}

// const defineGraphObject = (fabric) => {
//   fabric.Graph = fabric.util.createClass(fabric.Group, {
//     type: "ed_graph",
//     initialize: function (opts) {
//       const w = opts.width ? opts.width : 500;
//       const h = opts.height ? opts.height : 500;
//       const l = opts.left ? opts.left : 0;
//       const t = opts.top ? opts.top : 0;
//       const gridSpan = 16;
//       const defaults = {
//         hasControls: false,
//         left: l,
//         top: t,
//         clipPath: new fabric.Rect({
//           width: w,
//           height: h,
//           originX: "center",
//           originY: "center",
//         }),
//         originX: "left",
//         originY: "top",
//         width: w,
//         height: h,
//         selectable: false,
//         selection: true,
//         panning: false,
//         prevPos: { x: 0, y: 0 },
//         background: new fabric.Grid({
//           originX: "left",
//           originY: "top",
//           span: gridSpan,
//           width: (Math.ceil(w / gridSpan / 8) + 2) * gridSpan * 8,
//           height: (Math.ceil(h / gridSpan / 8) + 2) * gridSpan * 8,
//           left: -gridSpan * 8,
//           top: -gridSpan * 8,
//         }),
//         nodes: [],
//       };
//       const options = { ...defaults, ...opts };
//
//       this.initEvents();
//
//       this.callSuper(
//         "initialize",
//         [options.background, options.nodes].flat(),
//         options
//       );
//     },
//
//     initEvents: function () {
//       this.on("mousedown", (e: fabric.IEvent<MouseEvent>) => {
//         switch (e.button) {
//           case 1: {
//             const localPoint = this.toLocalPosition(e.pointer);
//             for (const node of this.nodes) {
//               if (node.containsPoint(localPoint)) {
//                 this.canvas.setActiveObject(node);
//                 this.bringToFront(node);
//               }
//             }
//             break;
//           }
//           case 3: {
//             this.prevPos = e.absolutePointer;
//             this.panning = true;
//             break;
//           }
//         }
//       });
//
//       this.on("mousemove", (e: fabric.IEvent<MouseEvent>) => {
//         if (this.panning) {
//           const dx = e.pointer.x - this.prevPos.x;
//           const dy = e.pointer.y - this.prevPos.y;
//           this.moveNodes(dx, dy);
//           this.moveBackground({ x: dx, y: dy });
//           // this.drawObject(this.canvas.toCanvasElement().getContext("2d"));
//           this.canvas.renderTop();
//           // this.drawSelectionBackground(this.canvas.getSelectionContext());
//           this.prevPos = e.pointer;
//         }
//       });
//
//       this.on("mouseup", (e: fabric.IEvent<MouseEvent>) => {
//         if (e.button === 3) {
//           this.panning = false;
//         }
//       });
//     },
//
//     toLocalPosition: function (point: { x: number; y: number }) {
//       return this.translateToOriginPoint(
//         this.toLocalPoint(point, "left", "top"),
//         "left",
//         "top"
//       );
//     },
//
//     moveNodes: function (dx: number, dy: number) {
//       for (const node of this.nodes) {
//         node.top += dy;
//         node.left += dx;
//         node.setCoords();
//       }
//     },
//
//     moveBackground: function (point: { x: number; y: number }) {
//       const localZeros = this.toLocalPosition({ x: 0, y: 0 });
//       this.background.top += point.y;
//       this.background.left += point.x;
//       if (
//         this.background.top >= localZeros.y ||
//         this.background.top <=
//           this.toLocalPosition({ y: -this.background.span * 8 * 2, x: 0 }).y
//       ) {
//         this.background.top = this.toLocalPosition({
//           y: -(this.background.span * 8),
//           x: 0,
//         }).y;
//       }
//       if (
//         this.background.left >= localZeros.x ||
//         this.background.left <=
//           this.toLocalPosition({ x: -this.background.span * 8 * 2, y: 0 }).x
//       ) {
//         this.background.left = this.toLocalPosition({
//           x: -(this.background.span * 8),
//           y: 0,
//         }).x;
//       }
//       this.background.setCoords();
//     },
//
//     addNode: function (node) {
//       this._objects.push(node);
//     },
//     addNodes: function (nodes) {
//       console.log(this);
//       for (const node of nodes) {
//         this.addNode(node);
//       }
//     },
//   });
// };
//
// export default defineGraphObjecta
