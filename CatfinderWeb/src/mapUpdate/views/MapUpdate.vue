<template>
	<EditMenu @edit="OpenMapMenu"></EditMenu>
	<RightClickMenu :show="showRightClickMenu" :showStreet="showRightClickMenuStreet" :x="MenuX" :y="MenuY" @create="CreateMap" @edit="EditMap" @delete="DeleteMap"></RightClickMenu>
	<div class="map-container" ref="mapContainer" @click="onMapClick" @dblclick="onMapDoubleClick">
	</div>
</template>
<script setup lang="ts">
	import EditMenu from "@/mapUpdate/views/EditMenu.vue"
	import RightClickMenu from "@/mapUpdate/views/RightClickMenu.vue"
	import { StreetMap } from "@/mapUpdate/services/StreetMap";
	import { onMounted, ref, onUnmounted } from "vue"
	import { loadingIndicator } from '@/services/LoadingIndicator'
	import Graphic from '@arcgis/core/Graphic';

	const mapContainer = ref<HTMLDivElement>();
	const streetMap = new StreetMap();

	const showRightClickMenu = ref(false);
	const showRightClickMenuStreet = ref(false);
	const MenuX = ref(0);
	const MenuY = ref(0);

	let mapStatus = "unknown";
	let drawingPoints: __esri.Point[] = []; // 用于存储绘制的点

	onMounted(() =>{
		streetMap.createMapView(mapContainer.value as HTMLDivElement, onGraphicClicked, onGraphicRightClicked);
	});

	function OpenMapMenu()
	{
		streetMap.displayStreetEdit();
	}

	function CreateMap() {
		mapStatus = "createmap";
		streetMap.enableDrawing(); // 启用绘图模式，但不传入回调
		showRightClickMenu.value = false; // 关闭右键菜单
	}

	function EditMap() {
		mapStatus = "editmap";
		showRightClickMenu.value = false; // 关闭右键菜单
		
		// 获取选中的图形
		const selectedGraphics = streetMap.getSelectedGraphics();
		
		if (selectedGraphics.length > 0) {
			loadingIndicator.show(); // 显示加载指示器
			streetMap.startEditing(selectedGraphics[0]).then(() => {
				console.log("Editing started");
			}).catch(error => {
				console.error("Error starting edit:", error);
			}).finally(() => {
				loadingIndicator.hide(); // 隐藏加载指示器
			});
		} else {
			console.log("No graphics selected for editing");
		}
	}

	function onMapClick(event: MouseEvent)
	{
		if (mapStatus === "createmap") {
			const mapPoint = streetMap.screenToMapPoint(event.clientX, event.clientY);
			if (mapPoint) {
				drawingPoints.push(mapPoint);
				streetMap.addPointGraphic(mapPoint); // 在地图上添加点标记
			}
		}
	}

	function onMapDoubleClick(event: MouseEvent)
	{
		if (mapStatus === "createmap" && drawingPoints.length >= 2) {
			event.preventDefault(); // 防止地图缩放
			const polyline = {
				type: "polyline",
				paths: [drawingPoints.map(p => [p.longitude, p.latitude])]
			};
			
			streetMap.addGraphic(polyline); // 在地图上添加线图形
			
			// 将线应用编辑到ArcGIS服务
			streetMap.applyEdit(polyline).then(() => {
				console.log("Line added to service successfully");
				resetDrawing();
			}).catch(error => {
				console.error("Error applying edit:", error);
			});
		}
	}

	function resetDrawing()
	{
		drawingPoints = []; // 重置绘制点
		mapStatus = "unknown"; // 重置状态
		streetMap.disableDrawing(); // 禁用绘图模式
		streetMap.clearTempGraphics(); // 清除临时图形
	}

	function onGraphicClicked()
	{
		showRightClickMenu.value = false;
	}
	
	function onGraphicRightClicked(graphics : Graphic[], ev: any)
	{
		showRightClickMenu.value = true;
		MenuX.value = ev.x;
		MenuY.value = ev.y;
		if (graphics.length == 0)
		{
			showRightClickMenuStreet.value = false;
		}
		else
		{
			showRightClickMenuStreet.value = true;
		}
	}

	// 清理函数
	onUnmounted(() => {
		streetMap.destroy(); // 清理地图资源
	});
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>

