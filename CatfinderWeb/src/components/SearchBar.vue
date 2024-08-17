<template>
<div class="search-bar">
	<div class="input-box">
		<div class="switch" @click="switchSearchType">
			<template v-if="searchType === 'address'">
				<i class="material-icons-round icon">not_listed_location</i>
			</template>
			<template v-if="searchType === 'cat'">
				<font-awesome-icon icon="cat" class="icon" />
			</template>
		</div>
	<div><input type="input" v-model="keyword"></div>
	<div class="search-btn" @click="$emit('search', keyword, searchType)"><i class="material-icons-round icon">route</i></div>
	</div>
</div>
</template>
<script lang="ts" setup>
	import { ref, defineEmits } from 'vue';

	const emit = defineEmits<{
		search: [keywords: string]
	}>()

	const keyword  = ref("");
	const searchType = ref("address");
	function switchSearchType()
	{
		if(searchType.value === "address")
		{
			searchType.value = "cat";
		}
		else
		{
			searchType.value = "address";
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
			grid-template-columns: 50px auto 50px;
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

