interface Point {
	latitude: number;
	longitude: number;
}

declare function simplify (points: Point[], tolerance?: number, highQuality?: boolean): Point[];
declare namespace simplify {}

export = simplify;
