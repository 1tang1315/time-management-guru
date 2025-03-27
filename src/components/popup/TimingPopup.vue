<template>
  <div class="timingPopup">
    <h4 class="title">{{ currentTodo.name }}</h4>
    <h4 class="carlet">
      <span :class="['iconfont', isCollect ? 'icon-shoucang' : 'icon-shoucang8']" @click="isCollectHandle"></span>
      {{ carlet }}
    </h4>
    <div class="time">
      <h2>{{ minutes.toString().padStart(2, '0') }} : {{ seconds.toString().padStart(2, '0') }}</h2>
    </div>
    <div class="btn">
      <button class="btn-pause" @click="handlePause" v-show="isRunning">暂停</button>
      <button class="btn-pause activate" @click="handlePause" v-show="!isRunning">继续</button>
      <button class="btn-end" @click="handleEnd">结束</button>
    </div>
  </div>
  <!-- 结束弹窗 -->
  <div v-if="isTheEndPopup" class="overlay">
    <div class="dialog-content">
      <h4 class="title">确认结束专注?</h4>
      <div class="input">
        <div class="experience">
          <textarea v-model="experience" placeholder="请输入心得体会..."></textarea>
        </div>
      </div>
      
      <div class="theEnd-btn">
        <button @click="theEndConfirm">确认</button>
        <button @click="theEndCancel">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { toRaw, ref, onUnmounted, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import moment from 'moment';
import { HabitActivityController } from "@/db/controller/HabitActivityController.js";
import { Activity } from "@/db/model/Activity.js";
import { TodoController } from "@/db/controller/TodoController.js";
import { UserController } from "@/db/controller/UserController.js";
import { ActivityController } from "@/db/controller/ActivityController.js";
import { HabitActivity } from "@/db/model/HabitActivity.js";
import { timerWorkerData } from '@/hooks/timeWorkerData.js';
import { todoData } from '@/hooks/todoData';
import { initStore } from '@/store/index.js';
import { storeToRefs } from "pinia";

const store = initStore();
const { user } = storeToRefs(store);

const { currentTodo } = todoData();
const { updateTimingPopupHandle } = todoData();

const { seconds, minutes, isRunning } = timerWorkerData();
const { ChangeIsRunningHandle, stopTimer, resetTimer, continueTimer, terminateWorkerHandle } = timerWorkerData();

const userController = new UserController();
const todoController = new TodoController();
const activityController = new ActivityController();
const habitActivityController = new HabitActivityController();

const endTime = ref('');
const isTheEndPopup = ref(false);
const experience = ref('');

const handlePause = () => {
  if(isRunning.value) {
    stopTimer();
    ChangeIsRunningHandle(false);
  } else {
    continueTimer();
    ChangeIsRunningHandle(true);
  }
}
const handleEnd = async () => {
  stopTimer();
  ChangeIsRunningHandle(false);
  if(minutes.value < 1) {
    ElMessage({
      message: '小于一分钟, 不做记录',
      type: 'warning'
    });
    
    updateTimingPopupHandle(false);
    resetTimer();
    currentTodo.value.isTiming = false;
    await todoController.update(toRaw(currentTodo.value));
    
    terminateWorkerHandle();
    return;
  }
  
  endTime.value = moment().format('YYYY-MM-DD HH:mm');
  isTheEndPopup.value = true;
}

const theEndConfirm = async () => {
  updateTimingPopupHandle(false);
  isTheEndPopup.value = false;
  
  const activity = new Activity({
    todoId: currentTodo.value.id,
    todoName: currentTodo.value.name,
    beginTime: currentTodo.value.beginTime,
    endTime: endTime.value,
    duration: minutes.value.toString(),
    experience: experience.value || '无'
  });
  
  if(currentTodo.value.isHabit) {
    const habitActivity = new HabitActivity({
      createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      todoId: currentTodo.value.id,
      todoName: currentTodo.value.name,
      clockInTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: '成功'
    });
    await habitActivityController.update(habitActivity);
  }
  
  currentTodo.value.isTiming = false;
  await todoController.update(toRaw(currentTodo.value));
  
  // 将该专注添如activities数据库
  await activityController.update(activity);
  
  resetTimer();
  terminateWorkerHandle();
}

const theEndCancel = () => {
  isTheEndPopup.value = false;
  continueTimer();
  ChangeIsRunningHandle(true);
}

// 每日语录
const isCollect = ref(false);
const carlet = ref('');

async function getCarlet() {
  const apiKey = 'b393eb0dc93d9c2b990d8aadd23137f9';
  const url = `/carletApi/fapig/soup/query?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    if(!response.ok) {
      throw new Error('请求失败');
    }
    
    const result = await response.json();
    if(result.reason === "success") {
      carlet.value = result.result.text;
      if(carlet.value) {
        sessionStorage.setItem('carlet', carlet.value);
      }
    }
  } catch(error) {
    console.error('请求错误:', error);
  }
}

onMounted(() => {
  isCollect.value = sessionStorage.getItem('isCollect') === 'true';
  carlet.value = sessionStorage.getItem('carlet');
  if(!carlet.value) {
    getCarlet();
  }
});

const isCollectHandle = async () => {
  isCollect.value = !isCollect.value;
  sessionStorage.setItem('isCollect', String(isCollect.value));
  
  if(isCollect.value && carlet.value) {
    user.value.motto?.push(carlet.value);
    await userController.update(toRaw(user.value));
    
    ElMessage({
      message: '语录收藏成功',
      type: 'success'
    });
  }
  
  if(!isCollect.value) {
    await ElMessageBox.confirm(
      '确定取消收藏该语录吗？',
      '提示',
      {
        type: 'warning'
      }
    );
    
    const index = user.value.motto?.findIndex(
      item => item === carlet.value
    );
    
    if(index !== undefined && index >= 0) {
      user.value.motto?.splice(index, 1);
      await userController.update(toRaw(user.value));
    }
  }
}

onUnmounted(() => {
  terminateWorkerHandle();
});
</script>

<style lang="scss" scoped>
// 计时弹窗
.timingPopup {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  z-index: 200;
  border-radius: 5px;
  background-color: #007acc;
  
  .title {
    text-align: center;
  }
  
  .time {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  
  .btn {
    position: absolute;
    bottom: 12px;
    width: 100%;
    display: flex;
    justify-content: space-around;
    
    .activate {
      background-color: #ddd;
    }
    
    .btn-pause,
    .btn-end {
      width: 50px;
      height: 25px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
    }
  }
}

// 确认结束弹窗
.dialog-content {
  padding: 10px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 280px;
  z-index: 1000;
  background-color: #217192;
  border-radius: 8px;
  
  .title {
    text-align: center;
    margin: 10px 0;
  }
  
  .input {
    display: flex;
    flex-direction: row;
    justify-content: center;
    
    .experience {
      display: flex;
      flex-direction: column;
      margin: 0 10px;
      text-align: center;
    }
    
    textarea {
      width: 250px;
      height: 150px;
      line-height: 18px;
      margin: 0;
      padding: 8px;
      border: none;
      border-radius: 10px;
      outline: none;
    }
  }
  
  .theEnd-btn {
    width: 100%;
    margin-top: 30px;
    display: flex;
    justify-content: space-around;
    
    button {
      cursor: pointer;
    }
  }
}

.carlet {
  width: 95%;
  margin: auto;
  padding: 10px;
  text-align: left;
  text-indent: 2em;
}
</style>