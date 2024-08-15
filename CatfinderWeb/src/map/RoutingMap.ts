import Map from "@arcgis/core/Map"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import SpatialReference from "@arcgis/core/geometry/SpatialReference"
import MapView from "@arcgis/core/Views/MapView"
import { SimpleRenderer } from "@arcgis/core/renderers"
import { SimpleMarkerSymbol, SimpleLineSymbol } from "@arcgis/core/symbols"
import Color from "@arcgis/core/Color"
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
import { MapUrl } from '@/map/ArcgisUrl'

export class RoutingMap
{
	private readonly _map : Map;
	private _mapView? : MapView;
	private _poiFeatureLayer? : FeatureLayer;

	constructor()
	{
		this._map = new Map({
			basemap: {
				title: "Open Streets Map",
				id: "OpenStreetMap",
				thumbnailUrl: "https://www.arcgis.com/sharing/rest/content/items/5d2bfa736f8448b3a1708e1f6be23eed/info/thumbnail/temposm.jpg?f=json",
				baseLayers: [
					new VectorTileLayer({
						url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer" 
					})]
			}
		});
		this.initLayers();
	}

	createMapView(container: HTMLDivElement) : MapView
	{
		this._mapView = new MapView({
			container: container,
			map: this._map,
			center: import.meta.env.APP_SHANGHAI_CENTER_POINT.split(',').map(n => parseFloat(n)),
			zoom: 15,
		});

		return this._mapView;
	}

	async searchPoi(keyword: string)
	{
		if (this._poiFeatureLayer === null)
		{
			return;
		}

		await this._poiFeatureLayer?.queryFeatures({
			returnGeometry: true,
			outFields: ['name'],
			where: `name like N'%${keyword}%'`
		});
	}

	private initLayers()
	{
		this._poiFeatureLayer = new FeatureLayer({
			url: MapUrl.MapEditingPOIUrl,
			spatialReference: SpatialReference.WebMercator,
			renderer: new SimpleRenderer({
				symbol: this.getPoiSymbol()
			})
		});
		this._map.add(this._poiFeatureLayer);
	}


	private getPoiSymbol()
	{
		const color = Color.fromHex('#6B7CFC');
		color.a = 1;

		return new SimpleMarkerSymbol({
			color: color,
			size: 16,
			outline: new SimpleLineSymbol({
				width: 1.333
			})
		});
	}
}

