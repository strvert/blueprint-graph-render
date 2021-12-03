import parse from "parse-css-color";

const pathRoundRect = (
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
  width: number,
  height: number,
  rounds: { lt: number; rt: number; rb: number; lb: number }
) => {
  const l = left;
  const t = top;
  const r = left + width;
  const b = t + height;
  ctx.beginPath();
  ctx.moveTo(l + rounds.lt, t);
  ctx.arcTo(r, t, r, b - rounds.rb, rounds.rt);
  ctx.arcTo(r, b, l + rounds.lb, b, rounds.rb);
  ctx.arcTo(l, b, l, t + rounds.lt, rounds.lb);
  ctx.arcTo(l, t, r, t, rounds.lt);
};

const defineNodeObject = (fabric) => {
  fabric.Node = fabric.util.createClass(fabric.Object, {
    type: "node",
    initialize: function (opt) {
      const defaults = {
        nodeColor: "rgb(31, 149, 255)",
        nodeTitle: "unknown",
        nodeHeaderHeight: 30,

        originX: 'left',
        originY: 'top',
        hasControls: false,
        width: 200,
        height: 200,
        opacity: 0.95,
        borderColor: "#EAA500",
        borderOpacityWhenMoving: 1,
        borderScaleFactor: 5,
      };

      const options = { ...defaults, ...opt };

      this.callSuper("initialize", options);
    },
    _render: function (ctx: CanvasRenderingContext2D) {
      ctx.save();

      const titlePosX = 26;
      ctx.font = "bold 13px san-serif";
      ctx.textAlign = "left";
      const mt = ctx.measureText(this.nodeTitle);
      this.set({ width: titlePosX + mt.width + 32 });

      this._renderBase(ctx);

      ctx.fillStyle = "#fefefe";
      ctx.fillText(this.nodeTitle, titlePosX, 18);

      ctx.restore();
    },
    _renderBase: function (ctx: CanvasRenderingContext2D) {
      const width = this.width;
      const height = this.height;
      const headerH = this.nodeHeaderHeight;
      ctx.translate(-width / 2, -height / 2);
      const inColor = parse(this.nodeColor);
      const headColor = `rgba(${inColor.values[0]}, ${inColor.values[1]}, ${inColor.values[2]}, ${this.opacity})`;
      const baseColor = `rgba(17, 17, 17, ${this.opacity})`;

      // Head
      ctx.save();
      let g = ctx.createLinearGradient(0, -headerH * 2, width, headerH * 2);
      g.addColorStop(0, headColor);
      g.addColorStop(0.7, headColor);
      g.addColorStop(1, baseColor);

      ctx.fillStyle = g;
      pathRoundRect(ctx, 0, 0, width, headerH, {
        lt: 10,
        rt: 10,
        rb: 0,
        lb: 0,
      });
      ctx.fill();
      ctx.restore();

      // Body
      ctx.save();
      ctx.fillStyle = baseColor;
      pathRoundRect(ctx, 0, headerH, width, height - headerH, {
        lt: 0,
        rt: 0,
        rb: 10,
        lb: 10,
      });
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = "#030303";
      ctx.lineWidth = 2;
      pathRoundRect(ctx, 0, 0, width, height, {
        lt: 10,
        rt: 10,
        rb: 10,
        lb: 10,
      });
      ctx.stroke();
      ctx.restore();
    },
  });
};

export default defineNodeObject;

// const drawRoundedRect = (
//   ctx: CanvasRenderingContext2D,
//   l: number,
//   r: number,
//   t: number,
//   b: number,
//   radius: number
// ) => {
//   ctx.beginPath();
//   ctx.moveTo(l + radius, t);
//   ctx.arcTo(r, t, r, b - radius, radius);
//   ctx.arcTo(r, b, l + radius, b, radius);
//   ctx.arcTo(l, b, l, t + radius, radius);
//   ctx.arcTo(l, t, r, t, radius);
//   ctx.stroke();
// };

// fabric.Node.prototype.drawBordersInGroup = function (
//   ctx,
//   options,
//   styleOverride
// ) {
//   styleOverride = styleOverride || {};
//   const bbox = fabric.util.sizeAfterTransform(this.width, this.height, options);
//   const strokeWidth = this.strokeWidth * 0.0;
//   const strokeUniform = this.strokeUniform;
//   const borderScaleFactor = this.borderScaleFactor;
//   const width =
//     bbox.x +
//     strokeWidth * (strokeUniform ? this.canvas.getZoom() : options.scaleX) +
//     borderScaleFactor;
//   const height =
//     bbox.y +
//     strokeWidth * (strokeUniform ? this.canvas.getZoom() : options.scaleY) +
//     borderScaleFactor;
//   ctx.save();
//   this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray);
//   ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
//
//   // ctx.strokeRect(-width / 2, -height / 2, width, height);
//   const l = -width / 2;
//   const r = width / 2;
//   const t = -height / 2;
//   const b = height / 2;
//   const radius = this.rx + strokeWidth / 2;
//   drawRoundedRect(ctx, l, r, t, b, radius);
//
//   ctx.restore();
//   return this;
// };
//
// fabric.Node.prototype.drawBorders = function (ctx: CanvasRenderingContext2D, styleOverride) {
//   styleOverride = styleOverride || {};
//   const wh = this._calculateCurrentDimensions();
//   const strokeWidth = this.borderScaleFactor;
//   const width = wh.x + strokeWidth * 0.83;
//   const height = wh.y + strokeWidth * 0.83;
//   const hasControls =
//     typeof styleOverride.hasControls !== "undefined"
//       ? styleOverride.hasControls
//       : this.hasControls;
//   let shouldStroke = false;
//
//   ctx.save();
//   ctx.strokeStyle = styleOverride.borderColor || this.borderColor;
//   this._setLineDash(ctx, styleOverride.borderDashArray || this.borderDashArray);
//
//   // ctx.strokeRect(-width / 2, -height / 2, width, height);
//   const l = -width / 2;
//   const r = width / 2;
//   const t = -height / 2;
//   const b = height / 2;
//   const radius = this.rx + strokeWidth / 2;
//   drawRoundedRect(ctx, l, r, t, b, radius);
//
//   if (hasControls) {
//     ctx.beginPath();
//     this.forEachControl(function (control, key, fabricObject) {
//       // in this moment, the ctx is centered on the object.
//       // width and height of the above function are the size of the bbox.
//       if (control.withConnection && control.getVisibility(fabricObject, key)) {
//         // reset movement for each control
//         shouldStroke = true;
//         ctx.moveTo(control.x * width, control.y * height);
//         ctx.lineTo(
//           control.x * width + control.offsetX,
//           control.y * height + control.offsetY
//         );
//       }
//     });
//     if (shouldStroke) {
//       ctx.stroke();
//     }
//   }
//   ctx.restore();
//   return this;
// };

// fabric.Group.prototype.hasControls = false;

// const drawRoundedRect = (
//   ctx: CanvasRenderingContext2D,
//   l: number,
//   r: number,
//   t: number,
//   b: number,
//   radius: number
// ) => {
//   ctx.beginPath();
//   ctx.moveTo(l + radius, t);
//   ctx.arcTo(r, t, r, b - radius, radius);
//   ctx.arcTo(r, b, l + radius, b, radius);
//   ctx.arcTo(l, b, l, t + radius, radius);
//   ctx.arcTo(l, t, r, t, radius);
//   ctx.stroke();
// };
