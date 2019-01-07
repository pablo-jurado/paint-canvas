const canvas = document.getElementById("draw");
const clearButton = document.getElementById("clear");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const colorsButton = document.querySelector(".colors");

const colorOptions = {
  black: "#000",
  red: "#f44336",
  green: "#4caf50"
};

let currentStrokeXY = [];
let allStrokes = [];
let strokeIndex = 0;
let selectedColor = colorOptions.black;

// canvas.width = 600;
// canvas.height = 600;
const ctx = canvas.getContext("2d");
ctx.lineJoin = "round";
ctx.lineCap = "round";
ctx.lineWidth = 2;

let isDrawing = false;
let fromX = null;
let fromY = null;

function draw(event) {
  if (isDrawing) {
    let toX = event.offsetX;
    let toY = event.offsetY;
    saveXY(fromX, fromY, toX, toY, selectedColor);
    paint(fromX, fromY, toX, toY, selectedColor);
  }
}

function paint(x, y, toX, toY, selectedColor) {
  console.log(selectedColor);
  ctx.strokeStyle = selectedColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  fromX = toX;
  fromY = toY;
}

function saveXY(fromX, fromY, toX, toY) {
  currentStrokeXY.push({
    fromX,
    fromY,
    toX,
    toY,
    selectedColor
  });
}

function handleMouseDown(event) {
  isDrawing = true;
  fromX = event.offsetX;
  fromY = event.offsetY;
}

function handleMouseUp() {
  if (currentStrokeXY.length !== 0) {
    allStrokes.push(currentStrokeXY);
    strokeIndex = allStrokes.length;
    currentStrokeXY = [];
  }
  isDrawing = false;
}

function handleMouseOut() {
  if (isDrawing) {
    allStrokes.push(currentStrokeXY);
    currentStrokeXY = [];
  }
  isDrawing = false;
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
      paint(item.fromX, item.fromY, item.toX, item.toY, item.selectedColor);
    });
  }
}

function handleClearButton() {
  clearCanvas();
  currentStrokeXY = [];
  allStrokes = [];
  strokeIndex = 0;
}

function handleColorsButton(event) {
  var color = event.target.id;
  if (color) {
    selectedColor = colorOptions[color];
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
