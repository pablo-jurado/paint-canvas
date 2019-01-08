const canvas = document.getElementById("draw");
const clearButton = document.getElementById("clear");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const colorsButton = document.querySelector(".colors");
const shapeButton = document.querySelector(".strokes");
const sizeButton = document.querySelector(".strokeSize");
const canvasSizeButton = document.querySelector(".canvasSize");

const ctx = canvas.getContext("2d");
ctx.lineJoin = "round";

const colorOptions = {
  black: "#000",
  red: "#f44336",
  green: "#4caf50"
};

const shapeOptions = {
  round: "round",
  square: "square"
};

const sizeOptions = {
  "stroke-small": 1,
  "stroke-medium": 10,
  "stroke-large": 20
};

const canvasSizeOptions = {
  "canvas-small": 300,
  "canvas-medium": 450,
  "canvas-large": 600
};

let stroke = {
  color: colorOptions.black,
  shape: shapeOptions.round,
  size: sizeOptions.small,
  x: null,
  y: null
};

let currentStroke = [];
let allStrokes = [];
let strokeIndex = 0;
let isDrawing = false;

function draw(event) {
  if (isDrawing) {
    const toX = event.offsetX;
    const toY = event.offsetY;
    const { x, y, color, shape, size } = stroke;
    currentStroke.push({
      x,
      y,
      toX,
      toY,
      color,
      shape,
      size
    });
    paint(x, y, toX, toY, color, shape, size);
  }
}

function paint(x, y, toX, toY, color, shape, size) {
  ctx.lineWidth = size;
  ctx.lineCap = shape;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  stroke.x = toX;
  stroke.y = toY;
}

function handleMouseDown(event) {
  isDrawing = true;
  stroke.x = event.offsetX;
  stroke.y = event.offsetY;
}

function handleMouseUp() {
  if (currentStroke.length !== 0) saveStroke();
  isDrawing = false;
}

function handleMouseOut() {
  if (isDrawing) saveStroke();
  isDrawing = false;
}

function saveStroke() {
  allStrokes.push(currentStroke);
  strokeIndex = allStrokes.length;
  currentStroke = [];
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function handleUndoButton() {
  if (strokeIndex - 1 >= 0) {
    strokeIndex = strokeIndex - 1;
    repaint();
  }
}

function handleRedoButton() {
  if (strokeIndex + 1 <= allStrokes.length) {
    strokeIndex = strokeIndex + 1;
    repaint();
  }
}

function repaint() {
  clearCanvas();

  for (let index = 0; index < strokeIndex; index++) {
    const strokes = allStrokes[index];
    strokes.forEach(item => {
      paint(
        item.x,
        item.y,
        item.toX,
        item.toY,
        item.color,
        item.shape,
        item.size
      );
    });
  }
}

function handleClearButton() {
  clearCanvas();
  currentStroke = [];
  allStrokes = [];
  strokeIndex = 0;
}

function handleColorsButton(event) {
  var color = event.target.id;
  if (color) stroke.color = colorOptions[color];
}

function handleShapeButton(event) {
  var shape = event.target.id;
  if (shape) stroke.shape = shapeOptions[shape];
}

function handleSizeButton(event) {
  var size = event.target.id;
  if (size) stroke.size = sizeOptions[size];
}

function handleCanvasButton(event) {
  var size = event.target.id;
  if (size) {
    canvas.width = canvasSizeOptions[size];
    canvas.height = canvasSizeOptions[size];
    repaint();
  }
}

// mouse events
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("mouseout", handleMouseOut);

//buttons events
clearButton.addEventListener("click", handleClearButton);
undoButton.addEventListener("click", handleUndoButton);
redoButton.addEventListener("click", handleRedoButton);
colorsButton.addEventListener("click", handleColorsButton);
shapeButton.addEventListener("click", handleShapeButton);
sizeButton.addEventListener("click", handleSizeButton);
canvasSizeButton.addEventListener("click", handleCanvasButton);
