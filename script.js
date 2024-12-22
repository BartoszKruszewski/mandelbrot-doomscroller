import init, { draw_mandelbrot } from "../pkg/mandelbrot_wasm_realtime.js";

const lowResX = 200;
const lowResY = 100;

const highResX = 1920;
const highResY = 1080;

let frameDrawed = false;
let renderResX = highResX;
let renderResY = highResY;
let centerX = -0.5;
let centerY =  0.0;
let scale   =  0.004;
let maxIter =  500;

let wheelTimeout;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartCenterX = 0;
let dragStartCenterY = 0;

let lastTime = performance.now();
let fps = 0;

async function main() {
  await init();

  document.addEventListener('mousedown', (e) => {
    clearTimeout(wheelTimeout);
    lowRes();
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartCenterX = centerX;
    dragStartCenterY = centerY;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    
    wheelTimeout = setTimeout(() => {
      highRes();
    }, 600);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStartX) * renderResX / window.innerWidth;
    const dy = (e.clientY - dragStartY) * renderResY / window.innerHeight;
    centerX = dragStartCenterX - dx * scale;
    centerY = dragStartCenterY - dy * scale;
  });

  document.addEventListener('wheel', (e) => {
    lowRes();
    e.preventDefault();
    const mouseX = e.clientX * renderResX / window.innerWidth;
    const mouseY = e.clientY * renderResY / window.innerHeight;
    const oldRe = centerX + (mouseX - renderResX/2) * scale;
    const oldIm = centerY + (mouseY - renderResY/2) * scale;

    const zoomFactor = 1.3;
    if (e.deltaY < 0) {
      scale /= zoomFactor;
    } else {
      scale *= zoomFactor;
    }

    centerX = oldRe - (mouseX - renderResX/2) * scale;
    centerY = oldIm - (mouseY - renderResY/2) * scale;
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(() => {
      highRes();
    }, 600);
  }, { passive: false });

  requestAnimationFrame(renderLoop);
}

function highRes() {
  scale *= renderResX / highResX;
  renderResX = highResX;
  renderResY = highResY;
  frameDrawed = false;
}

function lowRes() {
  scale *= renderResX / lowResX;
  renderResX = lowResX;
  renderResY = lowResY;
  frameDrawed = false;
}

function renderLoop() {
  updateFPS();
  drawFrame();
  updateHUD();
  requestAnimationFrame(renderLoop);
}

function drawFrame() {
  if (renderResX === lowResX || !frameDrawed) {
    const canvas = document.getElementById("canvas");
    let ctx = canvas.getContext('2d');

    canvas.width = renderResX;
    canvas.height = renderResY;

    let imageData = ctx.createImageData(renderResX, renderResY);
    imageData.data.set(
      draw_mandelbrot(centerX, centerY, scale, renderResX, renderResY, maxIter)
    );
    ctx.putImageData(imageData, 0, 0);
    ctx.scale(window.innerWidth / renderResX, window.innerHeight / renderResY);

    frameDrawed = true;
  }
}

function updateFPS() {
  const now = performance.now();
  const delta = now - lastTime;
  lastTime = now;
  fps = 1000 / delta;
}

function updateHUD() {
  const fpsElement = document.getElementById('fps');
  const zoomElement = document.getElementById('zoom');

  const currentZoom = 1 / scale;

  fpsElement.textContent = `FPS: ${fps.toFixed(1)}`;
  zoomElement.textContent = `Zoom: ${currentZoom.toFixed(2)}`;
}

main();
