// Color mapping utility for cube scanning
export function mapRGBToCubeColor(r, g, b) {
  const cubeColors = {
    white: [255, 255, 255],
    yellow: [255, 255, 0],
    red: [200, 0, 0],
    orange: [255, 128, 0],
    green: [0, 150, 0],
    blue: [0, 0, 200]
  };

  let closest = 'white';
  let minDistance = Infinity;

  for (const [name, [cr, cg, cb]] of Object.entries(cubeColors)) {
    const dist = Math.sqrt(
      (r - cr) ** 2 +
      (g - cg) ** 2 +
      (b - cb) ** 2
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = name;
    }
  }

  return closest;
}

// Get average color from a region of canvas
export function getAverageColor(canvas, x, y, width, height) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(x, y, width, height);
  const data = imageData.data;
  
  let r = 0, g = 0, b = 0;
  let pixelCount = 0;
  
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    pixelCount++;
  }
  
  return {
    r: Math.round(r / pixelCount),
    g: Math.round(g / pixelCount),
    b: Math.round(b / pixelCount)
  };
}
