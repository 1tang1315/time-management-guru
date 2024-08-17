<template>
  <div class="timingPopup">
    <h4 class="title">{{ currentTodo.text }}</h4>
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
          <span>心得</span>
          <textarea v-model="experience"></textarea>
        </div>

        <div class="status">
          <span>状态</span>
          <textarea v-model="status"></textarea>
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
import moment from 'moment';
import { toRaw, ref, onUnmounted } from 'vue';
import { todoData } from '@/hooks/todoData';
const { currentTodo } = todoData();
const { updateTimingPopupHandle, updateTodoHandle, updateTodoActivityHandle } = todoData();

import { timerWorkerData } from '@/hooks/timeWorkerData.js';
const { seconds, minutes, isRunning } = timerWorkerData();
const { ChangeIsRunningHandle, stopTimer, resetTimer, continueTimer, terminateWorkerHandle } = timerWorkerData();

const endDate = ref('');
const isTheEndPopup = ref(false);
const experience = ref('无');
const status = ref('已完成');

onUnmounted(() => {
  terminateWorkerHandle();
})

const handlePause = () => {
  if (isRunning.value) {
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
  if (minutes.value < 1) {
    alert('小于一分钟, 不做记录');
    updateTimingPopupHandle(false);
    resetTimer();
    currentTodo.value.isUnderway = false;
    await updateTodoHandle(toRaw(currentTodo.value));

    terminateWorkerHandle();
    return;
  }
  endDate.value = moment().format('YYYY-MM-DD HH:mm');
  isTheEndPopup.value = true;
}

const theEndConfirm = async () => {
  updateTimingPopupHandle(false);
  isTheEndPopup.value = false;
  const activityObject = {
    text: currentTodo.value.text,
    date: `${currentTodo.value.beginDate} 至 ${endDate.value}`,
    duration: minutes.value.toString(),
    content: {
      experience: experience.value, // 心得
      progress: '100%', // 完成度
      status: status.value // 默认已完成 后续可以扩展情绪等其他状态
    }
  };

  currentTodo.value.activities.push(activityObject);
  currentTodo.value.isUnderway = false;
  await updateTodoHandle(toRaw(currentTodo.value));

  // 将该专注添如activities数据库
  await updateTodoActivityHandle(activityObject)

  resetTimer();
  terminateWorkerHandle();
}
const theEndCancel = () => {
  isTheEndPopup.value = false;
  continueTimer();
  ChangeIsRunningHandle(true);
}
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

    .experience,
    .status {
      display: flex;
      flex-direction: column;
      margin: 0 10px;
      text-align: center;
    }

    textarea {
      width: 100px;
      height: 100px;
      margin: 0;
      border: none;
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
</style>