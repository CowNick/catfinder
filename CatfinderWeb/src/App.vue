<script setup lang="ts">
import {   RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
  <div class="page-header">
    <div class="pic">
      <img src="./assets/pics/happy-cat.jpg" />
    </div>
    <div>
      <div class="app-name">Catefinder</div>
      <div class="app-desc">Are you look for a cat? We can help you!</div>
    </div>
  </div>
    <!-- <div class="wrapper">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div> -->
  </header>
  <div>
      <RouterView />
  </div>
</template>

<style scoped lang="less">
header {
  line-height: 1.5;
  max-height: 100vh;
  width: 100%;
  .page-header
  {
    width:100%;
    background-color: linen;
    padding:10px;
    display: grid;
    grid-template: "a b" 2fr/100px;
    .app-name
    {
      font-weight: 700;
      font-size: 20px;
      line-height: 40px;
    }

    .pic img
    {
      height: 100px;
    }
  }
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}
</style>
