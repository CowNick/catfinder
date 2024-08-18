<template>
<div class="search-bar">
	<div class="input-box">
		<div class="switch" @click="switchSearchType">
			<template v-if="type === SearchType.Address">
				<i class="material-icons-round icon">not_listed_location</i>
			</template>
			<template v-if="type === SearchType.Cat"">
				<font-awesome-icon icon="cat" class="icon" />
			</template>
		</div>
	<div><input type="input" v-model="keyword"></div>
	<CameraBar></CameraBar>
	<div class="search-btn" @click="$emit('search', keyword, type)"><i class="material-icons-round icon">route</i></div>
	</div>
</div>
</template>
<script lang="ts" setup>
	import { ref, defineEmits } from 'vue';
	import CameraBar from "@/components/CameraBar.vue"
	import { SearchType } from '@/model';

	const emit = defineEmits<{
		search: [keywords: string, type:SearchType ],
	}>()
	const type = ref(SearchType.Address);

	const keyword  = ref("");
	function switchSearchType()
	{
		if(type.value === SearchType.Address)
		{
			type.value = SearchType.Cat;
		}
		else
		{
			type.value = SearchType.Address;
		}
	}
</script>
<style lang="less" scoped>
	.search-bar
	{
		position: absolute;
		z-index: 1000;
		padding: 15px 55px 5px 15px;
		width: 100%;
		.input-box
		{
			display: grid;
			grid-template-columns: 50px auto 40px 40px;
			width:100%;
			height: 42px;
    		border: 2px solid #a89c9c;
			border-radius: 8px;
			background-color: #fff;
			.icon-common(){
				display: flex;
				justify-content: center;
				height: 38px;
				background-color: aliceblue;
				border-radius: 5px;
				.icon
				{
					font-size: 36px;
					line-height: 38px;
				}
			}

			.switch
			{
				.icon-common();
			}

			input{
				width: 100%;
				border:none;
				height: 38px;
				&:focus
				{
					border:none;
					outline: none;
				}
			}

			.search-btn
			{
				.icon-common();
			}
		}

	}
</style>

