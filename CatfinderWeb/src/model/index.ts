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

// 在现有的代码中添加这个新接口
export interface RouteDestination {
	name: string;
	pictureUrl: string;
}