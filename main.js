const canvas = document.getElementById("draw");
const clearButton = document.getElementById("clear");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const colorsButton = document.querySelector(".colors");
const strokesButton = document.querySelector(".strokes");
const strokeSizeButton = document.querySelector(".strokeSize");

const colorOptions = {
  black: "#000",
  red: "#f44336",
  green: "#4caf50"
};

const strokeOptions = {
  round: "round",
  square: "square"
};

const strokeSizeOptions = {
  small: 1,
  medium: 10,
  large: 20
};
let currentStrokeXY = [];
let allStrokes = [];
let strokeIndex = 0;
let selectedColor = colorOptions.black;
let selectedStroke = strokeOptions.round;
let selectedStrokeSize = strokeSizeOptions.small;

// canvas.width = 600;
// canvas.height = 600;
const ctx = canvas.getContext("2d");
ctx.lineJoin = "round";

let isDrawing = false;
let fromX = null;
let fromY = null;

function draw(event) {
  if (isDrawing) {
    let toX = event.offsetX;
    let toY = event.offsetY;
    paint(
      fromX,
      fromY,
      toX,
      toY,
      selectedColor,
      selectedStroke,
      selectedStrokeSize
    );
  }
}

function paint(
  x,
  y,
  toX,
  toY,
  selectedColor,
  selectedStroke,
  selectedStrokeSize
) {
  currentStrokeXY.push({
    fromX,
    fromY,
    toX,
    toY,
    selectedColor,
    selectedStroke,
    selectedStrokeSize
  });

  ctx.lineWidth = selectedStrokeSize;
  ctx.lineCap = selectedStroke;
  ctx.strokeStyle = selectedColor;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  fromX = toX;
  fromY = toY;
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
      paint(
        item.fromX,
        item.fromY,
        item.toX,
        item.toY,
        item.selectedColor,
        item.selectedStroke,
        item.selectedStrokeSize
      );
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

function handleStrokesButton(event) {
  var stroke = event.target.id;
  if (stroke) {
    selectedStroke = strokeOptions[stroke];
  }
}

function handlestrokeSizeButtonButton(e) {
  var strokeSize = event.target.id;
  if (strokeSize) {
    selectedStrokeSize = strokeSizeOptions[strokeSize];
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
strokesButton.addEventListener("click", handleStrokesButton);
strokeSizeButton.addEventListener("click", handlestrokeSizeButtonButton);
