<script setup>

</script>

<template>
  <router-view></router-view>
</template>

<style>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

body,
h1,
ul {
  padding: 0;
  margin: 0;
}

html {
  color: var(--text-color);
  background-color: var(--background-color);
}

body {
  width: 100vw;
  overflow-x: hidden;
}

li {
  list-style: none;
}

::-webkit-scrollbar {
  width: 0;
  height: 0;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}


@font-face {
  font-family: 'icomoon';
  src: url('@/assets/css/fonts/icomoon.eot?hawbqe');
  src: url('@/assets/css/fonts/icomoon.eot?hawbqe#iefix') format('embedded-opentype'),
    url('@/assets/css/fonts/icomoon.ttf?hawbqe') format('truetype'),
    url('@/assets/css/fonts/icomoon.woff?hawbqe') format('woff'),
    url('@/assets/css/fonts/icomoon.svg?hawbqe#icomoon') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}
</style>
