import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/Views/MapView"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import { Extent, Point, Polygon, Polyline } from "@arcgis/core/geometry"
import { union as unionGeometry } from "@arcgis/core/geometry/geometryEngine"
import Geometry from "@arcgis/core/geometry/Geometry"
import Graphic from "@arcgis/core/Graphic"
import { SimpleRenderer } from "@arcgis/core/renderers"
import { SimpleMarkerSymbol, SimpleLineSymbol, TextSymbol } from "@arcgis/core/symbols"
import SpatialReference from "@arcgis/core/geometry/SpatialReference"
import Color from "@arcgis/core/Color"
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
import { MapUrl } from '@/map/ArcgisUrl'
import { CatGraphicLayer } from "@/map/Layers/CatLayer"
import { solve as solveMapRoute} from "@arcgis/core/rest/route"
import RouteParameters from "@arcgis/core/rest/support/RouteParameters"
import FeatureSet from "@arcgis/core/rest/support/FeatureSet"
import type { RouteStop } from "@/model"
import { loadingIndicator } from '@/services/LoadingIndicator'

export class RoutingMap
{
	private readonly _map : Map;
	private _mapView? : MapView;
	private _poiFeatureLayer? : FeatureLayer;
	private readonly _catGraphicLayer = new CatGraphicLayer();
	private _routeLayer? : GraphicsLayer;

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

	createMapView(container: HTMLDivElement, onGraphicClicked: (graphics: Graphic[]) => void) : MapView
	{
		this._mapView = new MapView({
			container: container,
			map: this._map,
			center: import.meta.env.APP_SHANGHAI_CENTER_POINT.split(',').map(n => parseFloat(n)),
			zoom: 15
		});
		this.initEvents(onGraphicClicked);
		return this._mapView;
	}

	async searchPoi(keyword: string)
	{
		if (this._poiFeatureLayer === undefined)
		{
			return;
		}

		this._poiFeatureLayer.url = MapUrl.MapEditingPOIUrl;
		const dataLayer = new FeatureLayer({
			url: MapUrl.MapEditingPOIUrl,
			spatialReference: SpatialReference.WebMercator
		});
		const featureSet =  await dataLayer.queryFeatures({
			returnGeometry: true,
			outFields: ['name'],
			where: `name like N'%${keyword}%'`
		});
		this.clearFeatureLayer(this._poiFeatureLayer);
		await this._poiFeatureLayer.applyEdits({ addFeatures: featureSet.features });
		const extentRes = await this._poiFeatureLayer.queryExtent();
		this._mapView?.goTo(extentRes.extent);
	}

	async newRoute(geometries : Geometry[])
	{
		const routeParameter = new RouteParameters({
			returnRoutes: true,
			returnStops: true,
			returnDirections: true,
			returnPolygonBarriers: true,
			startTimeIsUTC: true,
			preserveFirstStop: true,
			preserveLastStop: true,
			outSpatialReference: SpatialReference.WebMercator,
			directionsTimeAttribute: 'Time',
			directionsLengthUnits: 'kilometers',
			restrictUTurns: "allow-backtrack",
			outputLines: "true-shape",
			stops: new FeatureSet({
				features: geometries.map(g => ({
					geometry: g
				}))
			}),
		});

		const logParameterIfFailed = () =>{
			console.error("Failed to resolve route, please check the following route parameter:");
			console.log(routeParameter)
		};

		const routeStops: RouteStop[] = [];
		try
		{
			loadingIndicator.show();
			const result = await solveMapRoute(MapUrl.NARouteUrl, routeParameter, { method: "post", responseType : "json" });
			if (result.routeResults.length === 0)
			{
				logParameterIfFailed();
				return;
			}

			const routeResult = result.routeResults[0];
			const stops = routeResult.stops.map((graphic, index)=> ({
				StopGeometry: graphic.geometry,
				StopPath: undefined  as Geometry | undefined
			}));
			stops[0].StopPath = routeResult.route.geometry;
			Array.prototype.push.apply(routeStops, stops);
		}
		catch (err)
		{
			logParameterIfFailed();
			console.log(err);
		}
		finally
		{
			loadingIndicator.hide();
		}

		this._routeLayer?.graphics.removeAll();
		await this.clearFeatureLayer(this._poiFeatureLayer as FeatureLayer);
		await this.drawRouteOnMap(routeStops);
	}

	async drawRouteOnMap(routeStops: RouteStop[])
	{
		if(!this._routeLayer)
		{
			return;
		}

		this._routeLayer.graphics.removeAll();
		const graphics: Graphic[] = [];
		routeStops.forEach(stop => {
			const stopGraphic = this.wrapRouteStopGraphic(stop.StopGeometry);
			graphics.push(stopGraphic);
			graphics.push(stopGraphic.attributes.labelGraphic);
			graphics.push(this.wrapRouteDirectionLineGraphic(stop.StopPath));
		});
		this._routeLayer?.addMany(graphics);
		await this._mapView?.goTo(unionGeometry(graphics.map(g => g.geometry)).extent);
	}

	async searchCat(keywords: string)
	{
		await this._catGraphicLayer.SearchCat(keywords);
	}

	private initLayers()
	{
		this._poiFeatureLayer = new FeatureLayer({
			id: "poi_layer",
			spatialReference: SpatialReference.WebMercator,
			source: [],
			objectIdField: "ObjectId",
			fields: [
				{name: "ObjectId", type:"integer" },
				{name:"fclass", type:"string"},
				{name:"name", type: "string"}
			],
			geometryType:"point",
			renderer: new SimpleRenderer({
				symbol: this.getPoiSymbol()
			})
		});

		this._routeLayer = new GraphicsLayer({
			id: 'route_layer'
		});
		this._map.addMany([this._poiFeatureLayer, this._routeLayer]);
		this._catGraphicLayer.initLater(this._map);
	}

	private async initEvents(onGraphicClicked: (graphics: Graphic[]) => void)
	{
		if (this._mapView === undefined)
		{
			return;
		}

		this._mapView.on("click", async ev => {
			const hitTestResult =  await this._mapView?.hitTest(ev, { include: [ this._poiFeatureLayer as FeatureLayer, this._catGraphicLayer.catlayer as GraphicsLayer ] });
			if ((hitTestResult?.results?.length || 0) > 0)
			{
				const intersectedGraphics = hitTestResult?.results
					.filter(viewHit => viewHit.type === "graphic")
					.map(viewHit => viewHit.graphic)
					.filter(graphic => graphic.layer !== null) || [];
				if (intersectedGraphics.length > 0)
				{
					await this.dispatchClick(intersectedGraphics, onGraphicClicked);
				}
			}
		});
	}

	private async dispatchClick(graphics: Graphic[], onGraphicClicked: (graphics: Graphic[]) => void)
	{

		// current we only handle the first graphic
		const firstGraphic = graphics[0];
		let graphicWithAttribute : Graphic | undefined;
		if (firstGraphic.layer === this._poiFeatureLayer)
		{
			const featuresSet = await this._poiFeatureLayer.queryFeatures();
			graphicWithAttribute = featuresSet.features.find(g => g.attributes.ObjectId === firstGraphic.attributes.ObjectId) || undefined;
		}
		else if(firstGraphic.layer === this._catGraphicLayer.catlayer)
		{
			// TODO: need test whether the hit test return the full attributes.
		}

		if (graphicWithAttribute)
		{
			onGraphicClicked([graphicWithAttribute]);
		}
	}

	private async clearFeatureLayer(layer: FeatureLayer)
	{
		const featuresSet = await layer.queryFeatures();
		layer.applyEdits({deleteFeatures: featuresSet.features});
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

	private wrapRouteDirectionLineGraphic(line: Geometry) : Graphic
	{
		return new Graphic({
			geometry: line,
			symbol: new SimpleLineSymbol({
				style: "solid",
				width: 6,
				join: "round",
				color: Color.fromHex('#507d2a') //sap green
			})
		});
	}

	private wrapRouteStopGraphic(stop: Geometry) : Graphic
	{
		const getLabelGraphic = () => new Graphic({
			geometry: stop,
			symbol: new TextSymbol({
				text: "",
				color: Color.fromHex('#000'),
				yoffset: -3,
				font: {
					size: 12
				}
			})
		});

		return new Graphic({
			geometry: stop,
			symbol: new SimpleMarkerSymbol({
				style: "circle",
				color: Color.fromHex('#32cd32'),
				size: 16,
			}),
			attributes: {
				labelGraphic: getLabelGraphic()
			}
		});
	}
}

