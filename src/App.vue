<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { initStore } from '@/store/index.js';
import { User } from "@/db/model/User.js";
import { UserController } from "@/db/controller/UserController.js";

const userController = new UserController();

const store = initStore();

// 创建用户
onMounted(async () => {
  let user = await userController.getById(1);
  if(!user) {
    await userController.add(new User({
      username: 'admin',
      password: '123456',
      nickname: '唐流雨',
      motto: []
    }));
    user = await userController.getById(1);
  }
  store.setUser(user);
});

// window.addEventListener("beforeunload", (event) => {
//   event.preventDefault();
//   event.returnValue = '';
// });
</script>

<style lang="scss">
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
  transition:
    background-color 0.5s ease,
    color 0.3s ease;
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
</style>
