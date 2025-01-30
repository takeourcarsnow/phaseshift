// Helper function for vector math
function vec2(x, y) {
    return { x: x, y: y };
}

function vec2Sub(v1, v2) {
    return vec2(v1.x - v2.x, v1.y - v2.y);
}

function vec2Len(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

function vec2Scale(v, scale) {
    return vec2(v.x * scale, v.y * scale);
}

function vec2Normalize(v) {
    const len = vec2Len(v);
    return len > 0 ? vec2Scale(v, 1 / len) : vec2(0, 0);
} 