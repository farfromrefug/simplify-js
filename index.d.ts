interface Point {
  latitude: number;
  longitude: number;
}

declare function simplify(
  points: Point[],
  options: {
    tolerance?: number;
    highQuality?: boolean;
    latitudeKey: string | number;
    longitudeKey: string | number;
  }
): Point[];
declare namespace simplify {}

export = simplify;
