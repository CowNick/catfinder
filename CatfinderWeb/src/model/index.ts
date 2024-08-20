import type { Polyline } from "@arcgis/core/geometry";
import Geometry from "@arcgis/core/geometry/Geometry";

export enum SearchType {
	Address = 1,
	Cat
}

export interface RouteStop
{
	StopGeometry: Geometry
	StopPath: Polyline,
	Sequence?: number,
	Direction? : {
		pathLine: Polyline,
		directionText?: string,
		time?: number,
		length?: number
	}
}