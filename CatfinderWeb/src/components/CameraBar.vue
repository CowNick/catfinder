<template>
	<input class="upload" type="file" ref="file" @change="Upload"/>
	<div class="button" @click="$refs.file.click" ><i class="material-icons-outlined">add_photo_alternate</i></div>
</template>
<script setup lang="ts">
	import { ref, defineEmits } from 'vue';
	import { getAxiosWrapper } from "@/axios/axios"

	async function Upload(e)
	{
		let formData = new FormData();
		formData.append('file', e.currentTarget.files[0]);
		formData.append('cat', JSON.stringify({ Xcoord: 122.46981757804873, Ycoord: 32.234791846253444 }));
		let axiosInstance = getAxiosWrapper();
		let cat = await axiosInstance.postForm('api/CatPictures',
			formData,
			{
				headers: {
				'Content-Type': 'multipart/form-data'
				}
			}
		);
	}
</script>
<style lang="less" scoped>
	.upload
	{
		display: none;
	}

	.button
	{
		display: flex;
		justify-content: center;
		i {
			font-size: 38px;
		};
	}
</style>


