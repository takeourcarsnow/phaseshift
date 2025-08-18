export const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
export const lerp = (a,b,t)=>a+(b-a)*t;
export const TAU = Math.PI*2;
export const DEG = Math.PI/180;
export const byId = (id)=>document.getElementById(id);
export const hsl = (h,s,l)=>`hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
export const frac = (x)=>x - Math.floor(x);