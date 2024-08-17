<template>
	<EditMenu @edit="EditMap"></EditMenu>
	<div class="map-container" ref="mapContainer">
	</div>
</template>
<script setup lang="ts">
	import EditMenu from "@/mapUpdate/views/EditMenu.vue"
	import { StreetMap } from "@/mapUpdate/services/StreetMap";
	import { onMounted, ref } from "vue"
	import { loadingIndicator } from '@/services/LoadingIndicator'

	const mapContainer = ref<HTMLDivElement>();
	const streetMap = new StreetMap();

	onMounted(() =>{
		streetMap.createMapView(mapContainer.value as HTMLDivElement);
	});

	async function EditMap()
	{
		streetMap.displayStreetEdit();
	}
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>

