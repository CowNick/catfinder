<template>
<Transition enter-active-class="animate__slideInUp" leave-active-class="animate__slideOutDown" mode="out-in">
<div class="wizard-container animate__animated" v-if="props.show">
	<div class="content">
		<div class="place">
			<div class="pic-container" v-if="props.destination.pictureUrl">
				<img :src="props.destination.pictureUrl" alt="Destination" class="destination-image">
			</div>
			<span>{{ props.destination.name }}</span>
		</div>
		<div class="command">
			<el-button type="primary" color="#337ecc" @click="$emit('newRoute')"><font-awesome-icon icon="route" class="icon" />到这里</el-button>
		</div>
	</div>
</div>
</Transition>
</template>

<script setup lang="ts">
import { defineEmits, defineProps } from 'vue';
import type { RouteDestination } from '@/model';

const emit = defineEmits<{
	newRoute: [],
}>();

const props = defineProps<{
	show: boolean,
	destination: RouteDestination
}>();

</script>

<style lang="less" scoped>
	.wizard-container
	{
		z-index: 1001;
		width: 100%;
		position: absolute;
		padding: 15px 15px 25px 15px;
		bottom: 0px;
		.content
		{
			background-color: #fff;
			border: 1px solid #333;
			padding: 10px 10px;
			border-radius: 8px;
			align-content: center;
			display: grid;
			grid-template-columns: auto 120px;
			.place{
				height: auto;
				border: 2px dotted #146fb1;
				border-style: dashed;
				align-content: center;
				font-size: 16px;
				text-align: center;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				.pic-container
				{
					padding: 10px 10px 0 10px;
					margin-bottom: -10px;
					.destination-image {
						width: 200px;
						height: auto;
						object-fit: cover;
						border-radius: 8px;
					}
				}
			}
			.command
			{
				padding: 0 10px;
				.el-button
				{
					height: 35px;
					width: 100%;
					.icon
					{
						padding-right: 5px;
					}
				}
			}
		}
	}
</style>


