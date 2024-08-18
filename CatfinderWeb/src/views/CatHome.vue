<template>
	<SearchBar @search="applySearch" ></SearchBar>
	<NavBar/>
	<div class="map-container" ref="mapContainer">
	</div>
	<RouteWizard destination="人民广场" :show="showRouteWizard" />
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
import { SearchType } from '@/model';

	const mapContainer = ref<HTMLDivElement>();
	const routingMap = new RoutingMap();
	const showRouteWizard = ref(false);
	const searchType = ref<SearchType>();

	onMounted(() =>{
		routingMap.createMapView(mapContainer.value as HTMLDivElement, onGraphicClicked);
	});

	async function applySearch(keywords: string, type: SearchType)
	{
		searchType.value = type;
		showRouteWizard.value = !showRouteWizard.value;
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

	function onGraphicClicked(graphics : Graphic[])
	{
		console.log(graphics);
	}
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>

