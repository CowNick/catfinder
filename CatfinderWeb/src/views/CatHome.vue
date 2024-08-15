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
    import { useLoading } from 'vue-loading-overlay'

	const mapContainer = ref<HTMLDivElement>();
	const routingMap = new RoutingMap();
	const loadingIndicator = useLoading({
			isFullPage: true,
			loader: 'dots'
		});

	onMounted(() =>{
		routingMap.createMapView(mapContainer.value as HTMLDivElement);
	});

	async function applySearch(keywords: string)
	{
		const activeLoading = loadingIndicator.show();
		routingMap.searchPoi(keywords);
		activeLoading.hide();
	}
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>

