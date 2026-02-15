/** Northern or southern hemisphere, determined by latitude sign */
export type Hemisphere = "north" | "south";

/** Islamic twilight definition for Isha calculation */
export type Shafaq = "general" | "ahmer" | "abyad";

/** Piecewise interpolation coefficients for seasonal adjustment */
export interface SeasonalCoefficients {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
}
