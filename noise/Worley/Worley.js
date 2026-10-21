const canvas = document.getElementById("noiseCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth / 5;
  canvas.height = window.innerHeight / 5;
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

//Settings Panel

let depth = 50;
let pointAmount = parseInt(document.getElementById("pointsSlider").value);;
let radius = parseInt(document.getElementById("radiusSlider").value);
let n = parseInt(document.getElementById("nthDist").value);

//

function getPoints(pointAmount, maxX = canvas.width, maxY = canvas.height, maxZ = depth){
    const points = [];
    
    for (let i = 0; pointAmount > i; i++) { 

        var x = maxX * Math.random();
        var y = maxY * Math.random();
        var z = maxZ * Math.random();

        points.push({x, y, z});
        
    }

    return points; 

}

function rgba(r, g, b, a = 255) {
    return (a << 24) | (b << 16) | (g << 8) | r;
}
  
//Global Vars

const points = [], velocities = [];
let refreshID;

let paused = false;

let lastFrameTime = performance.now();
let fps = 0;

//

function generateWorleyData(){
  points.length = 0;
  velocities.length = 0;

  points.push(...getPoints(pointAmount));
  velocities.push(...getPoints(pointAmount, 2, 2, 2));
}

function generateNoise(move = true) {

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const buffer = new Uint32Array(imageData.data.buffer);

  const maxDist = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);

  if (move){
  for (let i = 0; i < points.length; i++) {
      points[i].x += velocities[i].x;
      points[i].y += velocities[i].y;
      points[i].z += velocities[i].z;

      if (points[i].x < 0 || points[i].x > canvas.width) velocities[i].x *= -1;
      if (points[i].y < 0 || points[i].y > canvas.height) velocities[i].y *= -1;
      if (points[i].z < 0 || points[i].z > depth) velocities[i].z *= -1;
    }
  }

  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {

      const index = y * canvas.width + x;
      let closestDist = maxDist;

      const dists = new Array;

      for (let i = 0; i < points.length; i++) {

        const dx = x - points[i].x;
        const dy = y - points[i].y;
        const dz = points[i].z;

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (closestDist > dist) closestDist = dist;

        if (dist <= radius) dists.push(dist);
      }

      dists.sort((a, b) => a - b);

      let red = Math.max(0, Math.min(255, 255 - (dists[n] / radius) * 255));
      let green = Math.max(0, Math.min(255, 255 - (dists[n+2] / radius) * 255));
      let blue = Math.max(0, Math.min(255, 255 - (dists[n+1] / radius) * 255));

      buffer[index] = rgba(red, green, blue);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  if (!paused) refreshID = requestAnimationFrame(generateNoise);
}

document.getElementById("refreshNoise").addEventListener("click", () => {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  cancelAnimationFrame(refreshID);

  generateWorleyData();
  generateNoise();
});

document.getElementById("pausePlay").addEventListener("click", () => {
  paused = !paused;

  if (!paused) {
    lastFrameTime = performance.now();
    generateNoise();
  } else {
    cancelAnimationFrame(refreshID); 
  }
});

document.getElementById("radiusSlider").addEventListener("input", () => {
  radius = parseInt(document.getElementById("radiusSlider").value);
  if (paused) generateNoise(false);
});

document.getElementById("nthDist").addEventListener("input", () => {
  n = parseInt(document.getElementById("nthDist").value);
  if (paused) generateNoise(false);
});

document.getElementById("pointsSlider").addEventListener("input", ()=> {
  let sliderVal = parseInt(document.getElementById("pointsSlider").value);
  let current = points.length;

  if (sliderVal > current) {

    const amountToAdd = sliderVal - current;
    points.push(...getPoints(amountToAdd));
    velocities.push(...getPoints(amountToAdd, 2, 2, 2)); 

  } else if (sliderVal < current) {

    const amountToRemove = current - sliderVal;
    points.splice(-amountToRemove, amountToRemove); 
    velocities.splice(-amountToRemove, amountToRemove); 

  }

})
  
generateWorleyData();
generateNoise();

