<template>
	<SearchBar @search="applySearch"></SearchBar>
	<NavBar></NavBar>
	<div class="map-container" ref="mapContainer">
	</div>
</template>
<script setup lang="ts">
	import SearchBar from "@/components/SearchBar.vue"
	import NavBar from "@/components/NavBar.vue"
	import { RoutingMap } from "@/map/RoutingMap";
	import { onMounted, ref } from "vue"
	import { loadingIndicator } from '@/services/LoadingIndicator'

	const mapContainer = ref<HTMLDivElement>();
	const routingMap = new RoutingMap();

	onMounted(() =>{
		routingMap.createMapView(mapContainer.value as HTMLDivElement);
	});

	async function applySearch(keywords: string, searchType: string)
	{
		loadingIndicator.show();
		if (searchType === "address")
		{
			await routingMap.searchPoi(keywords);
		}
		else
		{
			await routingMap.searchCat(keywords);
		}
		loadingIndicator.hide();
	}
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>

