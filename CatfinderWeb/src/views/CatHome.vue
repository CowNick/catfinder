<template>
	<SearchBar @search="applySearch" ></SearchBar>
	<NavBar/>
	<div class="map-container" ref="mapContainer">
	</div>
	<RouteWizard :destination="destination" :show="showRouteWizard" @new-route="newRoute"/>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import SearchBar from "@/components/SearchBar.vue"
import NavBar from "@/components/NavBar.vue"
import RouteWizard from "@/components/RouteWizard.vue";
import { RoutingMap } from "@/map/RoutingMap";
import { onMounted, ref } from "vue"
import { loadingIndicator } from '@/services/LoadingIndicator'
import type Graphic from "@arcgis/core/Graphic";
import Geometry from "@arcgis/core/geometry/Geometry"
import { SearchType } from '@/model';
import geoLocation from "@/services/GeoLocation"

const mapContainer = ref<HTMLDivElement>();
const routingMap = new RoutingMap();
const showRouteWizard = ref(false);
const searchType = ref<SearchType>();
const destination = ref('');
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
	destination.value = destinationGraphic.attributes.name;
	selectedGeometry = destinationGraphic.geometry;
	showRouteWizard.value = true;
}

async function newRoute()
{
	const currentLocation = await geoLocation.WhereAmI();
	if (currentLocation)
	{
		await routingMap.newRoute([currentLocation, selectedGeometry]);
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
