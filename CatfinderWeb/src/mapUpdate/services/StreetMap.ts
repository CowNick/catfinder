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
import { execute } from "@arcgis/core/rest/geoprocessor";
import { MapUrl } from '@/map/ArcgisUrl';

export class StreetMap
{
	private readonly _map : Map;
	private _mapView? : MapView;
	private _streetFeatureLayer = new StreetLayer();
	private _drawingLayer: GraphicsLayer;
	private _sketchViewModel?: SketchViewModel;
	private _editor?: Editor;
	private _selectedGraphics: Graphic[] = [];
	private _pendingEdits: { addFeatures: Graphic[], updateFeatures: Graphic[], deleteFeatures: Graphic[] } = {
		addFeatures: [],
		updateFeatures: [],
		deleteFeatures: []
	};

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
		this._pendingEdits.addFeatures.push(graphic);
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
			(this._editor.container as HTMLElement).appendChild(closeButton);
			this._mapView.ui.add(this._editor, "top-right");
		}

		// 启动编辑会话
		await this._editor.startUpdateWorkflowAtFeatureEdit(graphic);

		// 在编辑完成时，将更新的图形添加到 pendingEdits
		this._editor.on("edit-complete", (event) => {
			this._pendingEdits.updateFeatures.push(event.graphics[0]);
		});
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

	async deleteSelectedGraphics(): Promise<void> {
		if (!this._streetFeatureLayer.streetlayer) {
			console.error("Street layer is not initialized");
			throw new Error("Street layer is not initialized");
		}

		const selectedGraphics = this.getSelectedGraphics();
		if (selectedGraphics.length === 0) {
			console.log("No graphics selected for deletion");
			return;
		}

		this._pendingEdits.deleteFeatures.push(...selectedGraphics);
		// 不要立即应用删除，而是等待保存操作

		try {
			console.log("Attempting to delete", selectedGraphics.length, "graphics");
			const deleteResults = await this._streetFeatureLayer.streetlayer.applyEdits({
				deleteFeatures: selectedGraphics
			});

			console.log("Delete results:", deleteResults);

			if (deleteResults.deleteFeatureResults.length > 0) {
				deleteResults.deleteFeatureResults.forEach((result, index) => {
					if (result.error) {
						console.error(`Error deleting feature ${index}:`, result.error);
					} else {
						console.log(`Feature ${index} deleted successfully`);
					}
				});

				// 从图层中移除已删除的图形
				selectedGraphics.forEach(graphic => {
					this._streetFeatureLayer.streetlayer?.remove(graphic);
				});

				// 清除选择
				this._selectedGraphics = [];

				console.log("Graphics deleted successfully");
			} else {
				console.warn("No features were deleted");
			}
		} catch (error) {
			console.error("Error in deleteSelectedGraphics:", error);
			throw error; // 重新抛出错误，以便在调用方进行处理
		}
	}

	async saveMap(): Promise<void> {
		if (!this._streetFeatureLayer.streetlayer) {
			throw new Error("Street layer is not initialized");
		}

		try {
			const editResult = await this._streetFeatureLayer.streetlayer.applyEdits(this._pendingEdits);
			console.log("Edit results:", editResult);

			// 清空待处理的编辑
			this._pendingEdits = { addFeatures: [], updateFeatures: [], deleteFeatures: [] };

			// 刷新图层以显示更改
			await this._streetFeatureLayer.streetlayer.refresh();

			// 调用 buildnetwork GP 服务
			await this.runBuildNetworkGP();
		} catch (error) {
			console.error("Error saving map or running BuildNetwork GP:", error);
			throw error;
		}
	}

	private async runBuildNetworkGP(): Promise<void> {
		try {
			const params = {
				// 根据 GP 服务的要求设置参数
				// 例如：
				// input_features: this._streetFeatureLayer.streetlayer
			};

			execute(MapUrl.BuildNetworkGPUrl, params)
				.then((result) => {
					console.log("Geoprocessing task completed", result);
				})
				.catch((error) => {
					console.error("Geoprocessing task failed", error);
				});

			// 处理 GP 服务的结果
			// 例如，可能需要刷新地图或更新某些状态
			if (this._mapView) {
				await this._mapView.goTo(this._mapView.extent);
			}
		} catch (error) {
			console.error("Error running BuildNetwork GP:", error);
			throw error;
		}
	}

	private async updateMap(filePath: string): Promise<void> {
		try {
			const params = {
				// 根据 GP 服务的要求设置参数
				sde_path: "D:\\GIS Training\\arcgis\\ArcTutor\\CatTest.sde", 
				zip_path: filePath
				//zip_path: "D:\\GIS Training\\FinallyData\\shanghai-latest-free.shp.zip"// 将文件路径作为参数传递
			};

			await execute(MapUrl.UpdateMapGPUrl, params); // 假设您在 ArcgisUrl.ts 中定义了 UpdateMapGPUrl

			console.log("Update map task completed");
		} catch (error) {
			console.error("Error running update map GP:", error);
			throw error;
		}
	}
}

