<template>
  <div class="addActivityPopup">
    <h4 class="title">{{ currentTodo.name }}</h4>
    <div class="time">
      <el-date-picker
        v-model="timeRange"
        type="datetimerange"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        format="YYYY-MM-DD HH:mm"
        value-format="YYYY-MM-DD HH:mm"
        range-separator="至"
        @change="handleTimeConfig"
      />
    </div>
    
    <div class="input">
      <div class="experience">
        <textarea v-model="experience" placeholder="请输入心得体会..."></textarea>
      </div>
    </div>
    <div class="btn">
      <button class="btn-confirm" @click="addActivityConfirm">确认</button>
      <button class="btn-cancel" @click="addActivityCancel">取消</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import moment from 'moment';
import { todoData } from '@/hooks/todoData';
import { Activity } from "@/db/model/Activity.js";
import { ActivityController } from "@/db/controller/ActivityController.js";
import { HabitActivityController } from "@/db/controller/HabitActivityController.js";
import { HabitActivity } from "@/db/model/HabitActivity.js";

const habitActivityController = new HabitActivityController();
const { currentTodo } = todoData();
const { updateTodoActivityPopupHandle, updateTodoSettingPopupHandle } = todoData();

const activityController = new ActivityController();

const timeRange = ref([]);
const beginTime = ref(moment().format('YYYY-MM-DD HH:mm'))
const endTime = ref(moment().format('YYYY-MM-DD HH:mm'))
const experience = ref('');

const handleTimeConfig = () => {
  if(timeRange.value && timeRange.value.length === 2) {
    beginTime.value = timeRange.value[0]; // 开始时间
    endTime.value = timeRange.value[1];   // 结束时间
  } else {
    ElMessage({
      message: '请选择完整的时间范围',
      type: 'warning'
    });
  }
}

const addActivityConfirm = async () => {
  const duration = (
    new Date(endTime.value) - new Date(beginTime.value)
  ) / (1000 * 60);
  
  if(duration < 1) {
    ElMessage({
      message: '时间间隔不能小于一分钟, 不做记录',
      type: 'warning'
    });
    return;
  }
  
  const activityObject = new Activity({
    todoId: currentTodo.value.id,
    todoName: currentTodo.value.name,
    beginTime: beginTime.value,
    endTime: endTime.value,
    duration: duration.toString(),
    experience: experience.value || '无'
  });
  
  // 将该专注添如activities数据库
  await activityController.update(activityObject);
  
  if(currentTodo.value.isHabit) {
    const beginTimeData = await habitActivityController
      .getHabitActivityByClockInDayAndTodoId(
        beginTime.value.split(" ")[0],
        currentTodo.value.id
      );
    
    if(beginTimeData) {
      beginTimeData.count++;
      await habitActivityController.update(beginTimeData);
    } else {
      const habitActivity = new HabitActivity({
        createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        todoId: currentTodo.value.id,
        todoName: currentTodo.value.name,
        clockInDay: moment().format('YYYY-MM-DD'),
        status: true
      });
      await habitActivityController.update(habitActivity);
    }
  }
  
  ElMessage({
    message: '记录添加成功',
    type: 'success'
  });
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
    
    .experience {
      display: flex;
      flex-direction: column;
      margin: 0 10px;
      text-align: center;
    }
    
    textarea {
      width: 350px;
      height: 150px;
      margin: 5px 0;
      padding: 10px;
      border-radius: 10px;
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
    display: flex;
    margin-bottom: 10px;
    width: 100%;
  }
}
</style>