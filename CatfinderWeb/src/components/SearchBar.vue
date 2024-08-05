<template>
<div class="search-bar">
	<div class="input-box">
		<div class="switch"><i class="material-icons-round">not_listed_location</i></div>
		<div><input type="input"></div>
		<div class="search-btn"><i class="material-icons-round">route</i></div>
	</div>
</div>
</template>
<script lang="ts" setup>

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
				i
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

