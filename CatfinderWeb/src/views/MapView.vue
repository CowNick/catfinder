<template>
	<div class="main">
		<h4>map</h4>
		<div id="mapView" class="mapView"></div>
	</div>
</template>

<script>
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import '@arcgis/core/assets/esri/themes/light/main.css'

let map
let mapView
export default {
	data() {
		return {}
	},
	mounted() {
		this.initMap()
	},
	destroyed() {},
	methods: {
		initMap() {
			map = new Map({
				basemap: 'topo-vector',
			}) 
			mapView = new MapView({
				container: 'mapView',
				map: map,
				zoom: 4,
				center: [15, 65],
			})
			mapView.ui.move('zoom', 'bottom-right')
		},
	},
}
</script>

<style scoped lang="less">
.main {
	width: 100%;
	height: 100%;
	padding: 50px;
	text-align: center;
	.mapView {
		width: 1500px;
		height: 80%;
		margin: 15px 10%;
	}
}
</style>