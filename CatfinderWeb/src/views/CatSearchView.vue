<template>
	<div class="search">
    <test-son ref="sonRef" />
    <button @click="search">search</button>
  </div>
</template>
<script setup lang="ts">
	import { defineComponent, ref, computed } from "vue";
	import { useRouter } from "vue-router";

	const router = useRouter();

	function search() {
		router.push({path: '/CatListView'})
	}
</script>

