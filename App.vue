<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #fff;
  height: 100%;
  font-family: -apple-system-font, Helvetica Neue, Helvetica, sans-serif;
}
</style>