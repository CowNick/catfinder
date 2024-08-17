<template>
	<div class="navigation">
		<div class="button" @click="toggleMenu" ><i class="material-icons-round">menu</i></div>
		<div class="menu hide">
			<div class="item" @click="$emit('edit')">Edit Map</div>
			<div class="line"></div>
			<div class="item">Save Map</div>
			<div class="line"></div>
			<div class="item">Update Map</div>
		</div>
	</div>
</template>
<script setup lang="ts">
	import { ref, defineEmits } from 'vue';

	const emit = defineEmits<{
		edit: []
	}>()

	let menuOpend = false;

	function toggleMenu(e)
	{
		let target = e.currentTarget;
		let menu = e.currentTarget.nextElementSibling;
		if (menuOpend)
		{
			target.classList.remove("hide");
			menu.classList.add("hide");
		}
		else
		{
			target.classList.add("hide");
			menu.classList.remove("hide");
		}
		
		menuOpend = !menuOpend;
	}
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
				font-size: 42px;
			};

			&.hide
			{
				display: none;
			}
		}

		.menu
		{
			background-color: white;
			padding: 5px 0;
			border-radius: .5rem;
			box-shadow: 0 1px 4px 0 rgba(0, 0, 0, .1);
			.item
			{
				margin: 0 5px;
				padding: 5px 20px;
				font-size: 18px;
				&:hover
				{
					background-color: #f8f8f8;
				}

				&:first-child
				{
					border-radius: 0.5rem 0.5rem 0 0;
				}

				&:last-child
				{
					border-radius: 0 0 0.5rem 0.5rem;
				}
			}

			.line
			{
				margin: 0 5px;
				height: 3px;
				background-color: #3333;
			}

			&.hide
			{
				display: none;
			}
		}
	}
</style>


