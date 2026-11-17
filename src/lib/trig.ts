/**
 * Math.cos / Math.sin rounded to 6 decimals, for SVG coordinates computed during render.
 * The server (Node) and the browser can differ in the last digit of Math.sin, which makes the
 * server-rendered SVG attributes mismatch on hydration. Rounding first makes both sides compute
 * the same coordinates. Canvas drawing, which only runs in the browser, keeps the built-ins.
 */
export const cos = (a: number) => Math.round(Math.cos(a) * 1e6) / 1e6;
export const sin = (a: number) => Math.round(Math.sin(a) * 1e6) / 1e6;
