import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/Views/MapView"
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
import { StreetLayer } from "@/mapUpdate/services/StreetLayer"

export class StreetMap
{
	private readonly _map : Map;
	private _mapView? : MapView;
	private _streetFeatureLayer = new StreetLayer();

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

	displayStreetEdit()
	{
		this._streetFeatureLayer.displayStreetEdit(this._map);
	}
}

