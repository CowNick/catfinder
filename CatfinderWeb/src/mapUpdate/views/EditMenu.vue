<template>
	<div class="navigation">
		<el-dropdown size="large" trigger="click">
			<div class="button"><i class="material-icons-round">menu</i></div>
			<template #dropdown>
				<el-dropdown-menu class="menu">
					<el-dropdown-item @click="$emit('edit')">Edit Map</el-dropdown-item>
					<el-dropdown-item divided>Save Map</el-dropdown-item>
					<el-dropdown-item divided>Update Map</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>
</template>
<script setup lang="ts">
	import { ref, defineEmits } from 'vue';

	const emit = defineEmits<{
		edit: []
	}>()
</script>
<style lang="less" scoped>
	.navigation
	{
		padding-top: 15px;
		right: 5px;
		position: absolute;
		z-index: 1001;
		cursor: pointer;
		.button
		{
			i {
				color: white;
				font-size: 42px;
			};
		}
	}
</style>


