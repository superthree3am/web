<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style scoped>
#app {
  background-image: url('@/assets/background8.jpg');
  background-size: cover;  
  background-position: center; 
  min-height: 100vh; 
}
</style>
