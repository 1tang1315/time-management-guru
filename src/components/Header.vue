<template>
  <div class="header">
    <div class="left" @click="refreshPage">
      <h3>专注•记录</h3>
    </div>
    <span class="motto-show" v-if="!isEditing" @click="handleIsEditing">{{ user.title ?? '人生时间管理大师' }}</span>
    <input class="motto-edit" v-if="isEditing" ref="mottoEditRef" v-model="user.title" @keyup.enter="changeMotto" @blur="changeMotto"/>
    <div class="right">
      <div class="nav" @click="handleNavChange($event)">
        <li v-for="(item, index) in ['首页', '详情', '指南', '我的']" :key="item" :nav-index='index'
          :class="Number(NavActiveIndex) === index ? 'nav-active' : ''">{{ item }}
        </li>
      </div>
      <div class="time">
        {{ currentTime }}
        <i>{{ currentDate }}</i>
      </div>
      <div class="theme">
        <button @click="changeTheme">
          <span :key="isDarkTheme" :class="['iconfont', isDarkTheme ? 'icon-moon-fill' : 'icon-taiyang']"></span>
        </button>
      </div>
      <div class="sync" @click="handelIncrementSync">
        <span class="iconfont icon-chanpingdaquan" v-if="isIncrementSync === false"></span>
        <div v-else class="sync-text">
          数据同步中
          <div class="sync-loader"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, toRaw } from 'vue';
import { useRouter } from 'vue-router';
import { initStore } from '@/store/index.js';
import { storeToRefs } from 'pinia';
import moment from 'moment';
import { UserController } from "@/db/controller/UserController.js";
import { incrementSync } from "@/utils/webdavClient.js";

const userController = new UserController();
const store = initStore();
// 解构赋值 需要引入storeToRefs 才不会丢失响应式
const { NavActiveIndex, isDarkTheme, user } = storeToRefs(store);

const router = useRouter();

const currentTime = ref(moment().format('HH:mm:ss'));
const currentDate = ref(moment().format('YYYY-M-D'));

const updateCurrentTime = () => {
  currentTime.value = moment().format('HH:mm:ss');
  currentDate.value = moment().format('YYYY-M-D');
};

onMounted(() => {
  const timer = setInterval(updateCurrentTime, 1000);
  onUnmounted(() => {
    clearInterval(timer);
  });
});

const refreshPage = () => {
  window.location.reload();
}

const handleNavChange = (e) => {
  const target = e.target; // 获取被点击的元素
  if (target.tagName === 'LI') {
    // 修改索引并存到本地
    store.ChangeNavActiveIndex(target.getAttribute('nav-index'));
    if (target.textContent === '首页') {
      router.push('/');
    } else if (target.textContent === '详情') {
      router.push('/detail');
    } else if (target.textContent === '指南') {
      router.push('/guide');
    } else if (target.textContent === '我的') {
      router.push('/me');
    }
  }
}

onMounted(() => {
  document.documentElement.classList.toggle('dark-theme', isDarkTheme.value);
  document.documentElement.classList.toggle('light-theme', !isDarkTheme.value);
});
const changeTheme = () => {
  store.ChangeIsDarkTheme();
  document.documentElement.classList.toggle('dark-theme', isDarkTheme.value);
  document.documentElement.classList.toggle('light-theme', !isDarkTheme.value);
}

// 座右铭
const isEditing = ref(false);
const mottoEditRef = ref(null);

const handleIsEditing = () => {
  isEditing.value = !isEditing.value;
  if (isEditing.value) {
    nextTick(() => {
      mottoEditRef.value.focus();
    });
  }
}
const changeMotto = async () => {
  isEditing.value = false;

  await userController.update(toRaw(user.value));
}

// 增量同步
const isIncrementSync = ref(false);
const handelIncrementSync = async () => {
  isIncrementSync.value = true;
  
  try {
    await incrementSync();
    alert('数据同步成功');
  } catch(e) {
    console.log(e);
    alert('数据同步失败');
  }
  
  isIncrementSync.value = false;
}
</script>

<style lang="scss" scoped>
.nav-active {
  background-color: #13a4cd;
}

// 数据同步动画
.sync-text {
  display: flex;
  align-items: center;
  justify-content: center;
}

.sync-loader {
  width: 20px;
  aspect-ratio: 4;
  background: radial-gradient(circle closest-side, var(--text-color) 90%, #0000) 0/calc(100%/3) 100% space;
  clip-path: inset(0 100% 0 0);
  animation: l1 1s steps(4) infinite;
}

@keyframes l1 {
  to {
    clip-path: inset(0 -34% 0 0)
  }
}

.header {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 60px;
  padding-left: 190px;
  margin-bottom: 10px;
  border-bottom: 1px solid #13a4cd;
  background-color: var(--background-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    color: #13a4cd;
  }

  .motto-show {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    width: auto;
    height: auto;
    max-width: 500px;
    max-height: 60px;
    text-align: left;
    text-indent: 2em;
    word-wrap: break-word;
    font-size: calc(20px - 0.1vw);
    font-weight: 600;
    color: #13a4cd;
    outline: none;
    border: none;
    overflow-y: auto; 
    background-color: transparent;
  }
  .motto-edit {
    width: 500px;
    padding: 5px;
    font-size: 18px;
    outline: none;
  }

  .left {
    width: 100px;
    height: 50px;

    h3 {
      margin: 0;
      line-height: 55px;
      font-family: 'Brush Script MT', 'Comic Sans MS', cursive;
      cursor: pointer;
    }
  }

  .right {
    display: flex;
    align-items: center;

    .nav {
      display: flex;
      justify-content: space-between;
      width: 200px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border: 1px solid #fff;
      border-radius: 8px;
      margin-right: 10px;
      overflow: hidden;

      li {
        width: 60px;
        cursor: pointer;

        &:hover {
          background-color: #13a4cd;
        }
      }
    }

    .time {
      line-height: 60px;
      font-size: 20px;

      i {
        font-style: normal;
        font-size: 16px;
      }
    }
    
    .theme {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      width: 50px;
      height: 25px;
      margin: 0 10px;
      
      button {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 8px;
        border: 1px solid #ccc;
        background-color: transparent;
        cursor: pointer;
        transition: all 0.5s ease;
        
        .iconfont {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: var(--primary-color);
        }
        .icon-moon-fill {
          right: 2px;
        }
        .icon-taiyang {
          left: 2px;
        }
      }
    }
    
    .sync {
      display: flex;
      align-items: center;
      margin: 0 5px;
      width: 100px;
      height: 25px;
      font-size: 12px;
    }
  }
}
</style>