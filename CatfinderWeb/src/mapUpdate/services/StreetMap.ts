import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/Views/MapView"
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
import { StreetLayer } from "@/mapUpdate/services/StreetLayer"
import type Graphic from "@arcgis/core/Graphic"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"

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

	createMapView(container: HTMLDivElement, onGraphicClicked: () => void, onGraphicRightClicked: (graphics: Graphic[], ev: any) => void) : MapView
	{
		this._mapView = new MapView({
			container: container,
			map: this._map,
			center: import.meta.env.APP_SHANGHAI_CENTER_POINT.split(',').map(n => parseFloat(n)),
			zoom: 15,
		});

		this.initEvents(onGraphicClicked, onGraphicRightClicked);
		return this._mapView;
	}

	private async initEvents(onGraphicClicked: () => void, onGraphicRightClicked: (graphics: Graphic[], ev: any) => void)
	{
		if (this._mapView === undefined)
		{
			return;
		}

		this._mapView.on("click", async ev => {
			if (ev.button != 2)
			{
				onGraphicClicked();
				return;
			}

			if (!this._streetFeatureLayer.streetlayer)
			{
				return;
			}

			const hitTestResult =  await this._mapView?.hitTest(ev, { include: [ this._streetFeatureLayer.streetlayer as FeatureLayer ] });
			if ((hitTestResult?.results?.length || 0) > 0)
			{
				const intersectedGraphics = hitTestResult?.results
					.filter(viewHit => viewHit.type === "graphic")
					.map(viewHit => viewHit.graphic)
					.filter(graphic => graphic.layer !== null) || [];
				await this.dispatchClick(intersectedGraphics, ev, onGraphicRightClicked);
			}
			else
			{
				onGraphicRightClicked([], ev);
			}
		});
	}

	private async dispatchClick(graphics: Graphic[], ev: any, onGraphicRightClicked: (graphics: Graphic[], ev: any) => void)
	{
		// current we only handle the first graphic
		const firstGraphic = graphics[0];
		let graphicWithAttribute : Graphic | undefined;
		if (firstGraphic.layer === this._streetFeatureLayer.streetlayer)
		{
			graphicWithAttribute = firstGraphic;
		}

		if (graphicWithAttribute)
		{
			onGraphicRightClicked([graphicWithAttribute], ev);
		}
	}

	displayStreetEdit()
	{
		this._streetFeatureLayer.displayStreetEdit(this._map);
	}
}

