//------------------------------------------------------------------------------
// DOM elements
//------------------------------------------------------------------------------
const canvas = document.getElementById("draw");
const clearButton = document.getElementById("clear");
const undoButton = document.getElementById("undo");
const redoButton = document.getElementById("redo");
const saveModalButton = document.getElementById("save");
const openModalButton = document.getElementById("open");
const penButton = document.getElementById("pen");
const eraserButton = document.getElementById("eraser");
const selectedColor = document.getElementById("selectedColor");
const modal = document.getElementById("modal-wrapper");
const closeModalButton = document.getElementById("close-modal");
const cancelModalButton = document.getElementById("cancel-modal");
const openFileButton = document.getElementById("open-file");
const saveFileButton = document.getElementById("save-modal");
const modalFileInput = document.getElementById("modal-file-input");
const modalFileList = document.getElementById("modal-file-list");

const colorsButton = document.querySelector(".colors");
const canvasSizeButton = document.querySelector(".canvasSize");
const brushesButton = document.querySelector(".brushes-wrapper");

const ctx = canvas.getContext("2d");
ctx.lineJoin = "round";

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

const colorOptions = {
  white: "#fff",
  grey: "#afafaf",
  red: "#f44336",
  green: "#4caf50",
  yellow: "#def03c",
  blue: "#2926dd",
  black: "#000",
  "dark-grey": "#616161",
  "dark-red": "#922921",
  "dark-green": "#2e6d30",
  "dark-yellow": "#8f9b23",
  "dark-blue": "#171585"
};

const shapeOptions = {
  round: "round",
  square: "square"
};

const sizeOptions = {
  small: 1,
  medium: 10,
  large: 20
};

const canvasSizeOptions = {
  "canvas-small": [200, 300],
  "canvas-medium": [300, 450],
  "canvas-large": [400, 650]
};

let stroke = {
  color: null,
  shape: shapeOptions.round,
  size: sizeOptions.small,
  x: null,
  y: null
};

let keys = {
  z: false,
  y: false,
  Control: false
}

let currentStroke = [];
let allStrokes = [];
let strokeIndex = 0;
let isDrawing = false;

let savedFiles = [];

//------------------------------------------------------------------------------
// Functions
//------------------------------------------------------------------------------

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
  stroke.color = color;
  selectedColor.style.backgroundColor = color;
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

function handleUndo() {
  if (strokeIndex - 1 >= 0) {
    strokeIndex = strokeIndex - 1;
    repaint();
  }
}

function handleRedo() {
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
  updateColor(colorOptions.black);
  stroke.shape = shapeOptions.round;
  stroke.size = sizeOptions.small;
  stroke.x = null;
  stroke.y = null;
}

function handleEraserButton() {
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

function handleKeyDown(event) {
  if(event.key === "Control" || event.key === "z" || event.key === "y") {
    keys[event.key] = true;
  }

  if ( keys.Control && keys.z ) handleUndo();
  if ( keys.Control && keys.y ) handleRedo();
}

function handleKeyUp(event) {
  if(event.key === "Control" || event.key === "z" || event.key === "y") {
    keys[event.key] = false;
  }
}

function showSaveModal() {
  modal.classList.add("active", "save");
}

function showOpenModal() {
  modal.classList.add("active", "open");

  let fileNames = "";
  savedFiles.forEach(function(file) {
    fileNames += `<option value="${file.name}">${file.name}</option>`;
  });

  modalFileList.innerHTML = fileNames;
}

function closeModal() {
  modal.classList.remove("active", "open", "save");
}

function saveFile() {
  const fileName = modalFileInput.value;
  if (fileName !== "") {
    savedFiles.push({
      name: fileName,
      data: allStrokes,
    });
    localStorage.setItem("paint_files", JSON.stringify(savedFiles));
  }
  modalFileInput.value = "";
  handleClearButton();
  closeModal();
}

function getSavedFiles() {
  let filesFromStorage = JSON.parse(localStorage.getItem("paint_files"));
  if (filesFromStorage) {
    savedFiles = filesFromStorage
  }
}

function openFile() {
  let fileName = modalFileList.value;
  let fileData = null;
  if (fileName) {
    // reset canvas
    handleClearButton();

    for (let index = 0; index < savedFiles.length; index++) {
      const file = savedFiles[index];
      if (file.name === fileName) {
        fileData = file.data;
        break;
      }
    }

    allStrokes = fileData;
    strokeIndex = fileData.length;
    repaint();
    closeModal();
  }
}

function addMouseListeners() {
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseout", handleMouseOut);
}

function addButtonsListeners() {
  clearButton.addEventListener("click", handleClearButton);
  undoButton.addEventListener("click", handleUndo);
  redoButton.addEventListener("click", handleRedo);
  colorsButton.addEventListener("click", handleColorsButton);
  canvasSizeButton.addEventListener("click", handleCanvasButton);
  penButton.addEventListener("click", handlePenButton);
  eraserButton.addEventListener("click", handleEraserButton);
  brushesButton.addEventListener("click", handleBrushesButton);
  saveModalButton.addEventListener("click", showSaveModal);
  openModalButton.addEventListener("click", showOpenModal);
  cancelModalButton.addEventListener("click", closeModal);
  closeModalButton.addEventListener("click", closeModal);
  saveFileButton.addEventListener("click", saveFile);
  openFileButton.addEventListener("click", openFile);
}

function addKeyboardListeners() {
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
}

function init() {
  addMouseListeners();
  addButtonsListeners();
  addKeyboardListeners();
  updateColor(colorOptions.black);
  getSavedFiles();
}

init();
