<template>	
	<SearchBar @search="applySearch"></SearchBar>
	<NavBar></NavBar>
	<div class="map-container" ref="mapContainer">
	</div>
</template>
<script setup lang="ts">
	import SearchBar from "@/components/SearchBar.vue"
	import NavBar from "@/components/NavBar.vue"
	import Map from "@arcgis/core/Map"
	import MapView from "@arcgis/core/Views/MapView"
	import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
	import { onMounted, ref } from "vue"

	const mapContainer = ref<HTMLDivElement>();
	onMounted(() =>{
		const map = new Map({
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
		const view = new MapView({
			container: mapContainer.value,
			map: map,
			center: import.meta.env.APP_SHANGHAI_CENTER_POINT.split(',').map(n => parseFloat(n)),
			zoom: 15,
		});
	});


	function applySearch(keywords: string)
	{
		console.log(keywords);
	}
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>

