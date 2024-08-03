<template>
	<div class="map-container" ref="mapContainer">
	</div>
</template>
<script setup lang="ts">
	import Map from "@arcgis/core/Map"
	import MapView from "@arcgis/core/Views/MapView"
	import { onMounted, ref } from "vue"

	const mapContainer = ref<HTMLDivElement | null>(null);

	onMounted(() =>{
		const map = new Map({
			basemap:'streets-vector'});
		const view = new MapView({
			container: mapContainer.value,
			map: map,
			center: [-118.49178, 34.01185],
			zoom: 15,
		});
	});
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>

