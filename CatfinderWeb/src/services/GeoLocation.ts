import Geometry from "@arcgis/core/geometry/Geometry"
import Point from "@arcgis/core/geometry/Point";
import { geographicToWebMercator } from "@arcgis/core/geometry/support/webMercatorUtils"
import SpatialReference from "@arcgis/core/geometry/SpatialReference"
import { ElMessage } from 'element-plus'

class GeoLocation
{
	async WhereAmICoords()
	{
		let resolveFunc : (location : GeolocationPosition) => void
		let rejectFunc:  (err: GeolocationPositionError) => void
		const getPositionPromise = new Promise<GeolocationPosition>((resolve, reject) => {
			resolveFunc = resolve;
			rejectFunc = reject;
		});
		navigator.geolocation.getCurrentPosition(position => {
			resolveFunc(position);
		}, err => {
			console.warn(`Get current location failed, code: ${err.code } message: ${err.message}`);
			ElMessage({
				type: "warning",
				message: "老铁，能不能允许下定位！"
			});
			rejectFunc(err);
		});

		let currentLocation: GeolocationPosition | undefined = undefined;
		try
		{
			currentLocation = await getPositionPromise;
		}
		catch(err)
		{
			console.warn(err);
		}

		if (!currentLocation)
		{
			return undefined;
		}

		return {
			y: currentLocation.coords.latitude,
			x: currentLocation.coords.longitude
		};
	}

	async WhereAmI() : Promise<Geometry | undefined>
	{
		let coords = await this.WhereAmICoords();
		if (!coords)
		{
			return coords;
		}

		const point = new Point({
			spatialReference: SpatialReference.WGS84,
			y: coords.y,
			x: coords.x
		});
		return geographicToWebMercator(point);
	}
}
const geoLocation = new GeoLocation();
export default geoLocation;
