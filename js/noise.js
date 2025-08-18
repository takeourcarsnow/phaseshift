export function createPerlin(seed = 1337) {
  let p = new Uint8Array(512);
  let perm = new Uint8Array(512);
  function reseed(s) {
    let x = (s|0) || 1;
    for (let i = 0; i < 256; i++) { x = (1103515245 * x + 12345) & 0x7fffffff; p[i] = i; perm[i] = x & 255; }
    for (let i = 255; i > 0; i--) { const j = perm[i] % (i + 1); const t = p[i]; p[i] = p[j]; p[j] = t; }
    for (let i = 0; i < 256; i++) p[256 + i] = p[i];
  }
  reseed(seed);
  const grad2 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
  const fade = t => t*t*t*(t*(t*6-15)+10);
  function dot(gx, gy, x, y) { return gx*x + gy*y; }
  function noise2D(x, y) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const tl = p[X + p[Y]] % 8, tr = p[X + 1 + p[Y]] % 8, bl = p[X + p[Y + 1]] % 8, br = p[X + 1 + p[Y + 1]] % 8;
    const u = fade(xf), v = fade(yf);
    const x1 = dot(grad2[tl][0], grad2[tl][1], xf,     yf    ) * (1 - u) + dot(grad2[tr][0], grad2[tr][1], xf - 1, yf    ) * u;
    const x2 = dot(grad2[bl][0], grad2[bl][1], xf,     yf - 1) * (1 - u) + dot(grad2[br][0], grad2[br][1], xf - 1, yf - 1) * u;
    return x1 * (1 - v) + x2 * v;
  }
  function fbm2(x, y, oct=4, lac=2, gain=0.5) {
    let amp = 0.5, freq = 1, sum = 0, norm = 0;
    for (let i=0; i<oct; i++) { sum += amp * noise2D(x*freq, y*freq); norm += amp; amp *= gain; freq *= lac; }
    return sum / norm;
  }
  return { noise2D, fbm2, reseed };
}