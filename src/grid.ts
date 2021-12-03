const defineGridObject = (fabric) => {
  fabric.Grid = fabric.util.createClass(fabric.Object, {
    type: "grid",
    initialize: function (opt) {
      const defaults = {
        width: 500,
        height: 500,
        gridRegularColor: "#363636",
        gridRulerColor: "#020202",
        backgroundColor: "#272726",
        hasControls: false,
        selectable: false,
        hoverCursor: "default",
        span: 16,
      };
      const options = { ...defaults, ...opt };
      // const cmp = {
      //   width:
      //     (Math.ceil(options.width / options.span / 8) + 2) * options.span * 8,
      //   height:
      //     (Math.ceil(options.height / options.span / 8) + 2) * options.span * 8,
      //   left: -options.span * 8,
      //   top: -options.span * 8,
      // };

      this.callSuper("initialize", { ...options });
    },
    _render: function (ctx: CanvasRenderingContext2D) {
      ctx.save();

      ctx.translate(-this.width / 2, -this.height / 2);
      for (let x = 0; x < this.width; x += this.span) {
        this._drawLine(
          ctx,
          x,
          0,
          x,
          this.height,
          x % (8 * this.span) === 0
            ? this.gridRulerColor
            : this.gridRegularColor,
          1
        );
      }
      for (let y = 0; y < this.height; y += this.span) {
        this._drawLine(
          ctx,
          0,
          y,
          this.width,
          y,
          y % (8 * this.span) === 0
            ? this.gridRulerColor
            : this.gridRegularColor,
          1
        );
      }
      ctx.restore();
    },
    _drawLine: function (
      ctx: CanvasRenderingContext2D,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      width: number
    ) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    },
  });
};

export default defineGridObject;
