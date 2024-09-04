<template>
	<SearchBar @search="applySearch"></SearchBar>
	<NavBar/>
	<div class="map-container" ref="mapContainer">
	</div>
	<Directions v-if="directions.length > 0" :directions="directions" />
	<RouteWizard :destination="destination" :show="showRouteWizard" @new-route="newRoute"/>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import SearchBar from "@/components/SearchBar.vue"
import NavBar from "@/components/NavBar.vue"
import RouteWizard from "@/components/RouteWizard.vue";
import Directions from '@/components/Directions.vue';
import { RoutingMap, type RouteResult } from "@/map/RoutingMap";
import { onMounted, ref } from "vue"
import { loadingIndicator } from '@/services/LoadingIndicator'
import type Graphic from "@arcgis/core/Graphic";
import Geometry from "@arcgis/core/geometry/Geometry"
import { SearchType } from '@/model';
import geoLocation from "@/services/GeoLocation"
import type { RouteDestination } from '@/model';
import { fa } from 'element-plus/es/locales.mjs';

const mapContainer = ref<HTMLDivElement>();
const routingMap = new RoutingMap();
const showRouteWizard = ref(false);
const searchType = ref<SearchType>();
const destination = ref<RouteDestination>({ name: '', pictureUrl: '' });
const directions = ref<string[]>([]);
let selectedGeometry : Geometry;

onMounted(() =>{
	routingMap.createMapView(mapContainer.value as HTMLDivElement, onGraphicClicked);
});

async function applySearch(keywords: string, type: SearchType)
{
	searchType.value = type;
	if(keywords.trim() === '')
	{
		ElMessage({
			message: '小主，请输点东西吧，不然有点方！',
			type: 'warning',
		});
		return;
	}

	loadingIndicator.show();
	showRouteWizard.value = false;
	if (type === SearchType.Address)
	{
		await routingMap.searchPoi(keywords);
	}
	else
	{
		await routingMap.searchCat(keywords);
	}
	loadingIndicator.hide();
}

async function onGraphicClicked(graphics : Graphic[])
{
	if (graphics.length === 0)
	{
		return;
	}

	const destinationGraphic = graphics[0];
	destination.value = {
		name: destinationGraphic.attributes.name,
		pictureUrl: destinationGraphic.attributes.pictureUrl || ''
	};
	selectedGeometry = destinationGraphic.geometry;
	showRouteWizard.value = true;
}

async function newRoute() {
	const currentLocation = await geoLocation.WhereAmI();
	if (currentLocation) {
		loadingIndicator.show();
		try {
			const result: RouteResult = await routingMap.newRoute([currentLocation, selectedGeometry]);
			if (result.success) {
				directions.value = result.directions;
				showRouteWizard.value = false;
			} else {
				ElMessage({
					message: '无法计算路线，请稍后再试。',
					type: 'warning',
				});
			}
		} catch (error) {
			console.error('Failed to get route:', error);
			ElMessage({
				message: '获取路线失败，请稍后再试。',
				type: 'error',
			});
		} finally {
			loadingIndicator.hide();
		}
	}
}
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>
