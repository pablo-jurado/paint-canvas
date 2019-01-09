const canvas = document.getElementById("draw");
const clearButton = document.getElementById("clear");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const colorsButton = document.querySelector(".colors");
const canvasSizeButton = document.querySelector(".canvasSize");
const selectedColor = document.getElementById("selectedColor");
const penButton = document.getElementById("pen");
const eraserButton = document.getElementById("eraser");
const bucketButton = document.getElementById("bucket");
const brushesButton = document.querySelector(".brushes");

const ctx = canvas.getContext("2d");
ctx.lineJoin = "round";
ctx.fillStyle = "#fff";
ctx.fillRect(0, 0, canvas.width, canvas.height);

const colorOptions = {
  white: { r: 255, g: 255, b: 255 },
  grey: { r: 175, g: 175, b: 175 },
  red: { r: 245, g: 60, b: 60 },
  green: { r: 80, g: 180, b: 80 },
  yellow: { r: 222, g: 240, b: 60 },
  blue: { r: 40, g: 40, b: 220 },
  black: { r: 0, g: 0, b: 0 },
  "dark-grey": { r: 100, g: 100, b: 100 },
  "dark-red": { r: 140, g: 40, b: 30 },
  "dark-green": { r: 50, g: 110, b: 50 },
  "dark-yellow": { r: 150, g: 150, b: 35 },
  "dark-blue": { r: 20, g: 20, b: 130 }
};

const shapeOptions = {
  round: "round",
  square: "square"
};

const sizeOptions = {
  small: 5,
  medium: 15,
  large: 30
};

const canvasSizeOptions = {
  "canvas-small": [200, 300],
  "canvas-medium": [300, 450],
  "canvas-large": [400, 650]
};

let stroke = {
  color: null,
  rgb: null,
  shape: shapeOptions.round,
  size: sizeOptions.small,
  x: null,
  y: null
};

updateColor(colorOptions.black);

let currentStroke = [];
let allStrokes = [];
let strokeIndex = 0;
let isDrawing = false;
let isBucket = false;

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

function updateColor(color) {
  var rgb = `rgba(${color.r}, ${color.g}, ${color.b}, 255)`;
  stroke.color = rgb;
  stroke.rgb = color;
  selectedColor.style.backgroundColor = rgb;
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
  const x = event.offsetX;
  const y = event.offsetY;
  if (isBucket) {
    const oldColor = ctx.getImageData(x, y, 1, 1).data;
    const newColor = stroke.rgb;
    paintBucket(x, y, oldColor, newColor);
  } else {
    isDrawing = true;
    stroke.x = x;
    stroke.y = y;
  }
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

function paintBucket(_x, _y, oldColor, newColor) {
  // oldColor and newColor are the same
  if (
    newColor.r === oldColor[0] &&
    newColor.g === oldColor[1] &&
    newColor.b === oldColor[2]
  ) {
    console.log("oldColor and newColor are the same");
    return;
  }

  let canvasWidth = canvas.width;
  let canvasHeight = canvas.height;
  let pixelStack = [[_x, _y]];
  const colorLayer = ctx.getImageData(0, 0, canvasWidth, canvasHeight);

  while (pixelStack.length) {
    let newPos, x, y, pixelPos, reachLeft, reachRight;
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];

    pixelPos = (y * canvasWidth + x) * 4;
    while (y-- >= 0 && matchStartColor(pixelPos)) {
      pixelPos -= canvasWidth * 4;
    }
    pixelPos += canvasWidth * 4;
    ++y;
    reachLeft = false;
    reachRight = false;

    while (y++ < canvasHeight - 1 && matchStartColor(pixelPos)) {
      paintPixel(pixelPos);

      if (x > 0) {
        if (matchStartColor(pixelPos - 4)) {
          if (!reachLeft) {
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < canvasWidth - 1) {
        if (matchStartColor(pixelPos + 4)) {
          if (!reachRight) {
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      pixelPos += canvasWidth * 4;
    }
  }

  ctx.putImageData(colorLayer, 0, 0);

  function matchStartColor(pixelPos) {
    var r = colorLayer.data[pixelPos];
    var g = colorLayer.data[pixelPos + 1];
    var b = colorLayer.data[pixelPos + 2];

    return r == oldColor[0] && g == oldColor[1] && b == oldColor[2];
  }

  function paintPixel(pixelPos) {
    colorLayer.data[pixelPos] = newColor.r;
    colorLayer.data[pixelPos + 1] = newColor.g;
    colorLayer.data[pixelPos + 2] = newColor.b;
    colorLayer.data[pixelPos + 3] = 255;
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
  if (color) {
    updateColor(colorOptions[color]);
  }
}

function handleCanvasButton(event) {
  var size = event.target.id;
  if (size) {
    canvas.height = canvasSizeOptions[size][0];
    canvas.width = canvasSizeOptions[size][1];
    repaint();
  }
}

function handlePenButton() {
  isBucket = false;

  updateColor(colorOptions.black);
  stroke.shape = shapeOptions.round;
  stroke.size = sizeOptions.small;
  stroke.x = null;
  stroke.y = null;
}

function handleEraserButton() {
  isBucket = false;

  updateColor(colorOptions.white);
  stroke.shape = shapeOptions.round;
  stroke.size = sizeOptions.medium;
  stroke.x = null;
  stroke.y = null;
}

function handleBrushesButton(event) {
  var brush = event.target.id;
  if (brush) {
    switch (brush) {
      case "circle-xs":
        stroke.shape = shapeOptions.round;
        stroke.size = sizeOptions.small;
        break;
      case "circle-sm":
        stroke.shape = shapeOptions.round;
        stroke.size = sizeOptions.medium;
        break;
      case "circle-lg":
        stroke.shape = shapeOptions.round;
        stroke.size = sizeOptions.large;
        break;
      case "square-xs":
        stroke.shape = shapeOptions.square;
        stroke.size = sizeOptions.small;
        break;
      case "square-sm":
        stroke.shape = shapeOptions.square;
        stroke.size = sizeOptions.medium;
        break;
      case "square-lg":
        stroke.shape = shapeOptions.square;
        stroke.size = sizeOptions.large;
        break;
    }
  }
}

function handleBucketButton() {
  isBucket = true;
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
canvasSizeButton.addEventListener("click", handleCanvasButton);
penButton.addEventListener("click", handlePenButton);
eraserButton.addEventListener("click", handleEraserButton);
brushesButton.addEventListener("click", handleBrushesButton);
bucketButton.addEventListener("click", handleBucketButton);
