import Map from "@arcgis/core/Map"
import MapView from "@arcgis/core/Views/MapView"
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
import { StreetLayer } from "@/mapUpdate/services/StreetLayer"
import Graphic from "@arcgis/core/Graphic"
import FeatureLayer from "@arcgis/core/layers/FeatureLayer"
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer"
import Sketch from "@arcgis/core/widgets/Sketch"
import SketchViewModel from "@arcgis/core/widgets/Sketch/SketchViewModel"
import Editor from "@arcgis/core/widgets/Editor";

export class StreetMap
{
	private readonly _map : Map;
	private _mapView? : MapView;
	private _streetFeatureLayer = new StreetLayer();
	private _drawingLayer: GraphicsLayer;
	private _sketchViewModel?: SketchViewModel;
	private _editor?: Editor;
	private _selectedGraphics: Graphic[] = [];

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

		this._drawingLayer = new GraphicsLayer();
		this._map.add(this._drawingLayer);
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
		this.initSketchViewModel();
		return this._mapView;
	}

	private initSketchViewModel() {
		if (!this._mapView) return;

		this._sketchViewModel = new SketchViewModel({
			view: this._mapView,
			layer: this._drawingLayer,
			pointSymbol: {
				type: "simple-marker",
				style: "circle",
				color: '#6B7CFC',
				size: "8px"
			},
			polylineSymbol: {
				type: "simple-line",
				color: '#6B7CFC',
				width: 2
			}
		});

		this._sketchViewModel.on("create", (event) => {
			if (event.state === "complete") {
				this.applyEdit(event.graphic);
			}
		});
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

		// 添加选择事件处理
		this._mapView.on("click", async (event) => {
			const response = await this._mapView?.hitTest(event);
			this._selectedGraphics = response?.results
				.filter(result => result.graphic.layer === this._streetFeatureLayer.streetlayer)
				.map(result => result.graphic) || [];
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

	enableDrawing() {
		if (this._sketchViewModel) {
			this._sketchViewModel.create("polyline", { mode: "click" });
		}
	}

	disableDrawing() {
		if (this._sketchViewModel) {
			this._sketchViewModel.cancel();
		}
	}

	clearTempGraphics() {
		this._drawingLayer.removeAll();
	}

	async applyEdit(graphic: Graphic): Promise<void> {
		console.log("Applying edit to ArcGIS service", graphic);
		// 实现将graphic添加到ArcGIS服务的逻辑
		// 例如:
		// if (this._streetFeatureLayer.streetlayer) {
		//     try {
		//         const result = await this._streetFeatureLayer.streetlayer.applyEdits({
		//             addFeatures: [graphic]
		//         });
		//         console.log("Edit applied successfully", result);
		//     } catch (error) {
		//         console.error("Error applying edit:", error);
		//     }
		// }
	}

	async startEditing(graphic: Graphic): Promise<void> {
		if (!this._mapView || !this._streetFeatureLayer.streetlayer) return;

		// 如果编辑器还没有创建，创建它
		if (!this._editor) {
			const closeButton = document.createElement("div");

			// 创建关闭按钮的 HTML 和样式
			closeButton.innerHTML = `
				<button class="close-button">×</button>
			`;
			closeButton.style.cssText = `
				position: absolute;
				top: 5px;
				right: 5px;
				z-index: 1000;
			`;
			const buttonElement = closeButton.querySelector('.close-button') as HTMLButtonElement;
			buttonElement.style.cssText = `
				background: none;
				border: none;
				color: #333;
				font-size: 20px;
				cursor: pointer;
				padding: 0;
				line-height: 1;
			`;
			buttonElement.onclick = () => this.stopEditing();

			this._editor = new Editor({
				view: this._mapView,
				layerInfos: [{
					layer: this._streetFeatureLayer.streetlayer,
					enabled: true,
					addEnabled: false,
					updateEnabled: true,
					deleteEnabled: false
				}],
				container: document.createElement("div")
			});

			// 将关闭按钮添加到编辑器容器中
			this._editor.container.appendChild(closeButton);
			this._mapView.ui.add(this._editor, "top-right");
		}

		// 启动编辑会话
		await this._editor.startUpdateWorkflowAtFeatureEdit(graphic);
	}

	stopEditing(): void {
		if (this._editor) {
			this._editor.cancelWorkflow();
			this._mapView?.ui.remove(this._editor);
			this._editor.destroy();
			this._editor = undefined;
		}
	}

	getSelectedGraphics(): Graphic[] {
		return this._selectedGraphics;
	}

	destroy() {
		if (this._mapView) {
			this._mapView.destroy();
		}
	}
}

