import Geometry from "@arcgis/core/geometry/Geometry"
import Point from "@arcgis/core/geometry/Point";
import { geographicToWebMercator } from "@arcgis/core/geometry/support/webMercatorUtils"
import SpatialReference from "@arcgis/core/geometry/SpatialReference"
import { ElMessage } from 'element-plus'

class GeoLocation
{
	async WhereAmI() : Promise<Geometry | undefined>
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

		const point = new Point({
			spatialReference: SpatialReference.WebMercator,
			x: currentLocation.coords.longitude,
			y: currentLocation.coords.latitude,
		});
		return geographicToWebMercator(point);
	}
}
const geoLocation = new GeoLocation();
export default geoLocation;
