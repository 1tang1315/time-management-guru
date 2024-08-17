<template>
  <div class="header">
    <div class="left" @click="refreshPage">
      <h3>专注•记录</h3>
    </div>
    <h1 class="title">时间管理大师, 记录您的人生轨迹</h1>
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { initStore } from '@/store/index.js'
import { storeToRefs } from 'pinia'
import moment from 'moment';

const store = initStore()
// 解构赋值 需要引入storeToRefs 才不会丢失响应式
const { NavActiveIndex } = storeToRefs(store)

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
</script>

<style lang="scss" scoped>
.nav-active {
  background-color: #13a4cd;
}

.header {
  width: 100%;
  height: 60px;
  margin-bottom: 10px;
  background-color: #191919;
  display: flex;
  justify-content: space-around;
  align-items: center;

  .title {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    color: #13a4cd;
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
}
</style>