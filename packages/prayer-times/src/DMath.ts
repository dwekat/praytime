/** Degree to radian conversion factor */
const DEG_TO_RAD = Math.PI / 180;
/** Radian to degree conversion factor */
const RAD_TO_DEG = 180 / Math.PI;

/** Convert degrees to radians */
export function dtr(d: number): number {
  return d * DEG_TO_RAD;
}

/** Convert radians to degrees */
export function rtd(r: number): number {
  return r * RAD_TO_DEG;
}

/** Sine of angle in degrees */
export function sin(d: number): number {
  return Math.sin(dtr(d));
}

/** Cosine of angle in degrees */
export function cos(d: number): number {
  return Math.cos(dtr(d));
}

/** Tangent of angle in degrees */
export function tan(d: number): number {
  return Math.tan(dtr(d));
}

/** Arcsine returning degrees, clamped to [-1, 1] */
export function arcsin(d: number): number {
  return rtd(Math.asin(Math.max(-1, Math.min(1, d))));
}

/** Arccosine returning degrees, clamped to [-1, 1] */
export function arccos(d: number): number {
  return rtd(Math.acos(Math.max(-1, Math.min(1, d))));
}

/** Arctangent returning degrees */
export function arctan(d: number): number {
  return rtd(Math.atan(d));
}

/** Arccotangent returning degrees */
export function arccot(x: number): number {
  return rtd(Math.atan(1 / x));
}

/** Two-argument arctangent returning degrees */
export function arctan2(y: number, x: number): number {
  return rtd(Math.atan2(y, x));
}

/** Normalize angle to [0, 360) range */
export function fixAngle(a: number): number {
  return fix(a, 360);
}

/** Normalize hour to [0, 24) range */
export function fixHour(a: number): number {
  return fix(a, 24);
}

/** General normalization: wrap value to [0, b) range */
export function fix(a: number, b: number): number {
  let result = a - b * Math.floor(a / b);
  if (result < 0) {
    result += b;
  }
  return result;
}
