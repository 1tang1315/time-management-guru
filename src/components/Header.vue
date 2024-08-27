<template>
  <div class="header">
    <div class="left" @click="refreshPage">
      <h3>专注•记录</h3>
    </div>
    <span class="motto-show" v-if="!isEditting" @click="handleIsEditting">{{ motto }}</span>
    <input class="motto-edit" v-if="isEditting" ref="mottoEditRef" v-model="motto" @keyup.enter="changeMotto" @blur="changeMotto"/>
    <div class="right">
      <div class="nav" @click="handleNavChange($event)">
        <li v-for="(item, index) in ['首页', '详情', '指南', '我的']" :key="item" :nav-index='index'
          :class="NavActiveIndex == index ? 'nav-active' : ''">{{ item }}
        </li>
      </div>
      <div class="time">
        {{ currentTime }}
        <i>{{ currentDate }}</i>
      </div>
      <div class="theme">
        <button @click="changeTheme">
         <transition :name="isDarkTheme ? 'to-right' : 'to-left'">
          <span :key="isDarkTheme" :class="['iconfont', isDarkTheme ? 'icon-moon-fill' : 'icon-taiyang']"></span>
        </transition>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, onUpdated } from 'vue';
import { useRouter } from 'vue-router';
import { initStore } from '@/store/index.js';
import { storeToRefs } from 'pinia';
import moment from 'moment';

import { getMeByKey, updateMe } from '@/db/me.js';

const store = initStore();
// 解构赋值 需要引入storeToRefs 才不会丢失响应式
const { NavActiveIndex, isDarkTheme } = storeToRefs(store)

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
    // NavActiveIndex.value = target.getAttribute('nav-index');
    store.ChangeNavActiveIndex(target.getAttribute('nav-index'))
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
})
const changeTheme = () => {
  store.ChangeIsDarkTheme();
  document.documentElement.classList.toggle('dark-theme', isDarkTheme.value);
  document.documentElement.classList.toggle('light-theme', !isDarkTheme.value);
}

// 座右铭
const isEditting = ref(false);
const mottoEditRef = ref(null);
const motto = ref('');

onMounted(async () => {
  const mottoObj = await getMeByKey('motto');
  if (mottoObj) {
    motto.value = mottoObj.value;
  } else {
    motto.value = '人生时间管理大师';
  }
})
onUpdated(async () => {
  const mottoObj = await getMeByKey('motto');
  if (mottoObj) {
    motto.value = mottoObj.value;
  } else {
    motto.value = '人生时间管理大师';
  }
})
const handleIsEditting = () => {
  isEditting.value = !isEditting.value;
  if (isEditting.value) {
    nextTick(() => {
      mottoEditRef.value.focus();
    })
  }
}
const changeMotto = async () => {
  isEditting.value = false;
  const mottoObj = {
    key: "motto",
    value: motto.value
  }
  updateMe(mottoObj);
}
</script>

<style lang="scss" scoped>
.nav-active {
  background-color: #13a4cd;
}

.to-left-enter-active,
.to-left-leave-active {
  transition: all 0.3s ease;
}

.to-left-enter,
.to-left-leave-to {
  transform: translateX(-100%);
}

.to-right-enter-active,
.to-right-leave-active {
  transition: all 0.3s ease;
}

.to-right-enter,
.to-right-leave-to {
  transform: translateX(100%);
}

.header {
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  border-bottom: 1px solid #13a4cd;
  background-color: var(--background-color);
  display: flex;
  justify-content: space-evenly;
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
      margin-top: 18px;
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
  }

  .theme {
    position: absolute;
    right: 60px;
    width: 50px;
    height: 60px;
    line-height: 60px;
    text-align: center;

    button {
      position: relative;
      width: 100%;
      height: 22px;
      padding: 5px;
      border-radius: 8px;
      border: 1px solid #ccc;
      background-color: transparent;
      cursor: pointer;

      .iconfont {
        position: absolute;
        top: 0;
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
}</style>