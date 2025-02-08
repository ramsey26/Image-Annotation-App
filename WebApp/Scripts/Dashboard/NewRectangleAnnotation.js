export default class RectangleAnnotation {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.boxes = [];
    this.selectedBox = null;
    this.mousedown = false;
    this.startX = 0;
    this.startY = 0;
    this.options = Object.assign({
      strokeColor: "#ff0000",
      fillColor: "rgba(255, 255, 102, 0.5)",
      lineWidth: 2,
      minSize: 30,
    }, options);
    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    this.canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    this.canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
  }

  handleMouseDown(e) {
    this.mousedown = true;
    this.startX = e.offsetX;
    this.startY = e.offsetY;
    this.selectedBox = this.getBoxAt(this.startX, this.startY);
    if (!this.selectedBox) {
      this.boxes.push({ x: this.startX, y: this.startY, width: 0, height: 0 });
    }
  }

  handleMouseUp(e) {
    this.mousedown = false;
    if (this.selectedBox) return;
    let box = this.boxes[this.boxes.length - 1];
    if (box.width < this.options.minSize || box.height < this.options.minSize) {
      this.boxes.pop();
    }
    this.redraw();
  }

  handleMouseMove(e) {
    if (!this.mousedown) return;
    let x = e.offsetX, y = e.offsetY;
    if (this.selectedBox) {
      this.selectedBox.x += x - this.startX;
      this.selectedBox.y += y - this.startY;
      this.startX = x;
      this.startY = y;
    } else {
      let box = this.boxes[this.boxes.length - 1];
      box.width = x - box.x;
      box.height = y - box.y;
    }
    this.redraw();
  }

  getBoxAt(x, y) {
    return this.boxes.find(box => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height);
  }

  redraw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.boxes.forEach(box => {
      this.ctx.strokeStyle = this.options.strokeColor;
      this.ctx.fillStyle = this.options.fillColor;
      this.ctx.lineWidth = this.options.lineWidth;
      this.ctx.strokeRect(box.x, box.y, box.width, box.height);
      this.ctx.fillRect(box.x, box.y, box.width, box.height);
    });
  }
}
