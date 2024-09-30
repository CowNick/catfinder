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
import { ElMessage } from 'element-plus'
import { MapUrl } from '@/map/ArcgisUrl'
import { CatGraphicLayer } from "@/map/Layers/CatLayer"
import { solve as solveMapRoute} from "@arcgis/core/rest/route"
import RouteParameters from "@arcgis/core/rest/support/RouteParameters"
import FeatureSet from "@arcgis/core/rest/support/FeatureSet"
import type { RouteStop } from "@/model"
import { loadingIndicator } from '@/services/LoadingIndicator'
import * as locator from "@arcgis/core/rest/locator"
import { LongPressHandler } from './LongPressHandler'

export interface RouteResult {
	success: boolean;
	routeStops: RouteStop[];
	directions: string[];
}

export class RoutingMap
{
	private readonly _map : Map;
	private _mapView? : MapView;
	private _poiFeatureLayer? : FeatureLayer;
	private readonly _catGraphicLayer = new CatGraphicLayer();
	private _routeLayer? : GraphicsLayer;
	private longPressHandler: LongPressHandler | null = null;

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
		await this._poiFeatureLayer.applyEdits({ addFeatures: featureSet.features });
		const extentRes = await this._poiFeatureLayer.queryExtent();
		this._mapView?.goTo(extentRes.extent);
	}

	async newRoute(geometries: Geometry[]): Promise<RouteResult> {
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
			directionsLanguage: "zh-CN",
			directionsLengthUnits: 'kilometers',
			restrictUTurns: "allow-backtrack",
			outputLines: "true-shape",
			stops: new FeatureSet({
				features: geometries.map(g => ({
					geometry: g
				}))
			}),
		});

		const logParameterIfFailed = () => {
			console.error("Failed to resolve route, please check the following route parameter:");
			console.log(routeParameter)
		};

		const routeStops: RouteStop[] = [];
		let directions: string[] = [];
		let success = true;

		try {
			loadingIndicator.show();

			// 反向地理编码
			const locationNames = await this.reverseGeocode(geometries);

			const result = await solveMapRoute(MapUrl.NARouteUrl, routeParameter, { method: "post", responseType: "json" });
			if (result.routeResults.length === 0) {
				logParameterIfFailed();
				success = false;
				return { success, routeStops, directions };
			}

			const routeResult = result.routeResults[0];
			const stops = routeResult.stops.map((graphic, index) => ({
				StopGeometry: graphic.geometry,
				StopPath: undefined as Geometry | undefined,
				Name: locationNames[index] || `Stop ${index + 1}`
			}));
			stops[0].StopPath = routeResult.route.geometry;
			Array.prototype.push.apply(routeStops, stops);

			// 提取路线指引信息并替换通用名称
			directions = routeResult.directions.features.map(feature => {
				let text = feature.attributes.text;
				stops.forEach((stop, index) => {
					text = text.replace(`Location ${index + 1}`, stop.Name);
				});
				return text;
			});
		}
		catch (err) {
			logParameterIfFailed();
			console.log(err);
			success = false;
		}
		finally {
			loadingIndicator.hide();
		}

		this._routeLayer?.graphics.removeAll();
		await this.clearFeatureLayer(this._poiFeatureLayer as FeatureLayer);
		this._catGraphicLayer.catLayer?.removeAll();
		if (routeStops.length === 0) {
			ElMessage({
				type: "error",
				message: "Dude, you should be careful, I'm a little fragile"
			});
			success = false;
		}
		else {
			await this.drawRouteOnMap(routeStops);
		}

		return { success, routeStops, directions };
	}

	private async reverseGeocode(geometries: Geometry[]): Promise<string[]> {
		try {
			const results = await Promise.all(geometries.map(geometry => 
				locator.locationToAddress(MapUrl.GeoLocatorUrl, {
					location: geometry.type === "point" ? geometry as Point : (geometry as Polygon | Polyline).extent.center,
					outSpatialReference: SpatialReference.WebMercator
				})
			));
			return results.map(result => result.address || "Unknown Location");
		} catch (error) {
			console.error("Reverse geocoding failed:", error);
			return geometries.map(() => "Unknown Location");
		}
	}

	async drawRouteOnMap(routeStops: RouteStop[])
	{
		if(!this._routeLayer)
		{
			return;
		}

		this._routeLayer.graphics.removeAll();
		const graphics: Graphic[] = [];
		routeStops.forEach((stop, index) => {
			const stopGraphic = this.wrapRouteStopGraphic(stop.StopGeometry, index);
			graphics.push(this.wrapRouteDirectionLineGraphic(stop.StopPath));
			graphics.push(stopGraphic);
			graphics.push(stopGraphic.attributes.labelGraphic);
		});
		this._routeLayer?.addMany(graphics);
		if (graphics.length > 0)
		{
			await this._mapView?.goTo(unionGeometry(graphics.map(g => g.geometry)).extent);
		}
	}

	async searchCat(keywords: string)
	{
		await this._catGraphicLayer.SearchCat(keywords);
		if (this._catGraphicLayer.catLayer && this._catGraphicLayer.catLayer.graphics.length > 0) {
			const extent = this._catGraphicLayer.catLayer.graphics.reduce((acc, graphic) => {
				if (!graphic.geometry) return acc;
				const pointExtent = graphic.geometry.type === "point" 
					? new Extent({
						xmin: (graphic.geometry as Point).x,
						ymin: (graphic.geometry as Point).y,
						xmax: (graphic.geometry as Point).x,
						ymax: (graphic.geometry as Point).y,
						spatialReference: graphic.geometry.spatialReference
					  })
					: graphic.geometry.extent;
				return acc ? acc.union(pointExtent) : pointExtent;
			}, null as Extent | null);

			if (extent) {
				await this._mapView?.goTo(extent.expand(1.2));
			}
		}
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

	private initEvents(onGraphicClicked: (graphics: Graphic[]) => void)
	{
		if (this._mapView === undefined)
		{
			return;
		}

		this._mapView.on("click", async ev => {
			const hitTestResult =  await this._mapView?.hitTest(ev, { include: [ this._poiFeatureLayer as FeatureLayer, this._catGraphicLayer.catLayer as GraphicsLayer ] });
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

		this.longPressHandler = new LongPressHandler(this._mapView);
		this.longPressHandler.initLongPressEvent();
	}

	async clearBothPoiAndCatLayerGraphic()
	{
		this._poiFeatureLayer && this.clearFeatureLayer(this._poiFeatureLayer);
		this._catGraphicLayer.catLayer?.removeAll();
		this._routeLayer?.removeAll();
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
		else if(firstGraphic.layer === this._catGraphicLayer.catLayer)
		{
			graphicWithAttribute = this._catGraphicLayer.catLayer.graphics.find(g => g.attributes?.ObjectId === firstGraphic.attributes?.ObjectId)
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

	private wrapRouteStopGraphic(stop: Geometry, index: number) : Graphic
	{
		const getLabelGraphic = () => new Graphic({
			geometry: stop,
			symbol: new TextSymbol({
				text: index === 0 ? "起" : "终",
				color: Color.fromHex('#fff'),
				yoffset: -3,
				font: {
					size: 10,
					weight: "bold"
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

