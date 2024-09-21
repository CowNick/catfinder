<template>
	<div class="navigation" :style="{ left: props.x + 'px', top: props.y + 'px' }" v-if="props.show">
		<el-menu class="el-menu-vertical-demo">
			<el-menu-item index="1" @click="$emit('create')">
				<span>Create Map</span>
			</el-menu-item>
			<el-menu-item index="2" v-if="props.showStreet" @click="$emit('edit')">
				<span>Update Map</span>
			</el-menu-item>
			<el-menu-item index="3" v-if="props.showStreet" @click="$emit('delete')">
				<span>Delete Map</span>
			</el-menu-item>
		</el-menu>
	</div>
</template>
<script setup lang="ts">
	import { ref, defineEmits, defineProps } from 'vue';

	const emit = defineEmits<{
		create: [],
		edit: [],
		delete: []
	}>()

	const props = defineProps<{
		show: boolean,
		showStreet: boolean,
		x: number,
		y: number,
	}>();
</script>
<style lang="less" scoped>
	.navigation
	{
		top: 0;
		left: 0;
		position: absolute;
		z-index: 1001;
		cursor: pointer;
	}
</style>


