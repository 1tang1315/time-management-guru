<template>
  <div class="addActivityPopup">
    <h4 class="title">{{ currentTodo.text }}</h4>
    <div class="time">
      <div class="beginTime">
        <VueCtkDateTimePicker v-model="beginTime" label="请选择开始时间" locale="zh-cn" format="YYYY-MM-DD HH:mm" auto-close
          id="开始时间" />
      </div>
      <div class="endTime">
        <VueCtkDateTimePicker v-model="endTime" label="请选择结束时间" locale="zh-cn" format="YYYY-MM-DD HH:mm" auto-close
          id="结束时间" />
      </div>
    </div>
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
    <div class="btn">
      <button class="btn-confirm" @click="addActivityConfirm">确认</button>
      <button class="btn-cancel" @click="addActivityCancel">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref, toRaw } from 'vue';
import moment from 'moment';

import VueCtkDateTimePicker from 'vue-ctk-date-time-picker';
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css';

import { todoData } from '@/hooks/todoData';
const { currentTodo } = todoData();
const { updateTodoHandle, updateTodoActivityHandle, updateTodoActivityPopupHandle, updateTodoSettingPopupHandle } = todoData();

const beginTime = ref(moment().format('YYYY-MM-DD HH:mm'))
const endTime = ref(moment().format('YYYY-MM-DD HH:mm'))
const experience = ref('无');
const status = ref('已完成');

const addActivityConfirm = async () => {
  const duration = (new Date(endTime.value) - new Date(beginTime.value)) / (1000 * 60);
  if (duration < 1) {
    alert("时间间隔不能小于一分钟, 不做记录");
    updateTodoActivityPopupHandle(false);
    return;
  }
  const activityObject = {
    text: currentTodo.value.text,
    date: `${beginTime.value} 至 ${endTime.value}`,
    duration: duration.toString(),
    content: {
      experience: experience.value,
      progres: "100%",
      status: status.value
    }
  }
  // 更新todos表和activities表
  currentTodo.value.activities.push(activityObject);
  await updateTodoHandle(toRaw(currentTodo.value));

  // 将该专注添如activities数据库
  await updateTodoActivityHandle(activityObject)
  alert("记录添加成功");
  updateTodoActivityPopupHandle(false);
  updateTodoSettingPopupHandle(false);
}
const addActivityCancel = () => {
  updateTodoActivityPopupHandle(false);
}
</script>

<style lang="scss" scoped>
// 添加计时功能
.addActivityPopup {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  padding: 10px;
  z-index: 200;
  border-radius: 5px;
  background-color: #007acc;

  .title {
    text-align: center;
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

  .btn {
    width: 80%;
    display: flex;
    justify-content: space-evenly;
    margin: 35px auto;

    .btn-confirm,
    .btn-cancel {
      width: 50px;
      height: 25px;
      border-radius: 5px;
      border: none;
      cursor: pointer;
    }
  }

  .time {
    .beginTime,
    .endTime {
      margin-bottom: 10px;
    }
  }
}
</style>