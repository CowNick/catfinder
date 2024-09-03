<template>
	<div class="directions-container" v-if="directions.length">
		<div class="directions-bar" @click="toggleDirections">
			Directions
		</div>
		<div class="directions-content" :class="{ 'expanded': isExpanded }">
			<ul>
				<li v-for="(direction, index) in directions" :key="index">
					{{ direction }}
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
	directions: string[]
}

const props = withDefaults(defineProps<Props>(), {
	directions: () => []
})

const isExpanded = ref(false)

const toggleDirections = () => {
	isExpanded.value = !isExpanded.value
}
</script>

<style lang="less" scoped>
.directions-container {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	z-index: 1000;

	.directions-bar {
		background-color: #4CAF50;
		color: white;
		text-align: center;
		padding: 10px;
		cursor: pointer;
	}

	.directions-content {
		background-color: white;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.3s ease-out;
		border-top-left-radius: 10px;
		border-top-right-radius: 10px;

		&.expanded {
			max-height: 300px;
			overflow-y: auto;
		}

		ul {
			list-style-type: none;
			padding: 15px;

			li {
				margin-bottom: 10px;
			}
		}
	}
}
</style>
