<template>
	<EditMenu @edit="OpenMapMenu"></EditMenu>
	<RightClickMenu :show="showRightClickMenu" :showStreet="showRightClickMenuStreet" :x="MenuX" :y="MenuY" @create="CreateMap" @edit="EditMap" @delete="DeleteMap"></RightClickMenu>
	<div class="map-container" ref="mapContainer">
	</div>
</template>
<script setup lang="ts">
	import EditMenu from "@/mapUpdate/views/EditMenu.vue"
	import RightClickMenu from "@/mapUpdate/views/RightClickMenu.vue"
	import { StreetMap } from "@/mapUpdate/services/StreetMap";
	import { onMounted, ref } from "vue"
	import { loadingIndicator } from '@/services/LoadingIndicator'

	const mapContainer = ref<HTMLDivElement>();
	const streetMap = new StreetMap();

	const showRightClickMenu = ref(false);
	const showRightClickMenuStreet = ref(false);
	const MenuX = ref(0);
	const MenuY = ref(0);

	onMounted(() =>{
		streetMap.createMapView(mapContainer.value as HTMLDivElement, onGraphicClicked, onGraphicRightClicked);
	});

	function OpenMapMenu()
	{
		streetMap.displayStreetEdit();
	}

	let mapStatus = "unknow";

	function CreateMap()
	{
		mapStatus = "createmap"
	}

	function EditMap()
	{
		mapStatus = "edit"
	}

	function DeleteMap()
	{
		
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
</script>
<style lang="less" scoped>
	.map-container
	{
		width: 100%;
		height: 100%;
	}
</style>

