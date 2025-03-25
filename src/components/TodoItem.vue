<template>
  <draggable :list="localList" item-key="id" :move="onMove">
    <template #item="{ element: item }">
      <li :key="item.id">
        <input :id="item.name" type="checkbox" v-model="item.completed" @change="isCompleted(item)">
        <label :for="item.name" :class="{ 'completed': item.completed }" class="text">{{ item.name }}</label>
        <button class="begin" :disabled="item.isTiming" @click="handleBegin(item)">开始</button>
        <button class="get-detail" @click="getTodoDetail(item)" v-if="page === 'guide'">详情</button>
        <button class="setting" @click="handleSetting(item)">设置</button>
      </li>
    </template>
  </draggable>
  
  <teleport to='body'>
    <TodoSettingPopup v-if="todoSettingPopup" :todoId="todoId"/>
  </teleport>
</template>

<script setup>
import { ref, watch, toRaw, onMounted, inject } from 'vue';
import draggable from 'vuedraggable';
import TodoSettingPopup from '@/components/popup/TodoSettingPopup.vue';
import { todoData } from '@/hooks/todoData';
import { timerWorkerData } from '@/hooks/timeWorkerData.js';
import { TodoController } from "@/db/controller/TodoController.js";
import { HabitActivityController } from "@/db/controller/HabitActivityController.js";
import { HabitActivity } from "../db/model/HabitActivity.js";
import moment from 'moment';

const { currentTodo, todoSettingPopup } = todoData();
const { ChangeCurrentTodoHandle, updateTodoSettingPopupHandle, updateTimingPopupHandle } = todoData();

const { ChangeIsRunningHandle, initWorkerHandle, startTimer, resetTimer } = timerWorkerData();

const todoController = new TodoController();
const habitActivityController = new HabitActivityController();

const props = defineProps(['list', 'page']);
const emit = defineEmits(['updateTodoList']);
const handleTodoDetail = inject('handleTodoDetail', todo => {
});

const todoId = ref('');
const localList = ref([]);

onMounted(async () => {
  localList.value = props.list;
});

const onMove = async (evt) => {
  const { index, futureIndex } = evt.draggedContext;
  
  if(index !== futureIndex) {
    const draggedElement = localList.value[index];
    const targetElement = localList.value[futureIndex];
    
    try {
      const changeOrder = draggedElement.order;
      draggedElement.order = targetElement.order;
      targetElement.order = changeOrder;
      
      await todoController.update(toRaw(draggedElement));
      await todoController.update(toRaw(targetElement));
    } catch(err) {
      alert('更新失败!!!');
      console.error("更新失败:", err);
    }
  }
  
  emit('updateTodoList', [...localList.value]);
}

watch(() => props.list, async (newList) => {
  localList.value = [...newList].sort((a, b) => a.order - b.order);
  
  if(localList.value.length <= 0 || !localList.value[0].isHabit) {
    return;
  }
  
  const currentTime = moment().format('YYYY-MM-DD');
  
  const habitList = await habitActivityController.getHabitActivityByClockInTime(currentTime);
  
  // 已打卡习惯活动, 周期性状态更新
  // 1. 提取出进入已经打卡的todo的id
  const habitTodoIds = new Set(
    habitList?.map(h => h?.todoId) ?? []
  );
  
  // 2. 将今日未打卡数据的 completed 重新设置为 false
  localList?.value.forEach((item, index, arr) => {
    if(item.isHabit && !habitTodoIds.has(item.id)) {
      arr[index].completed = false;
    }
  });
  
  // 预期未打卡记录生成
  // ['每天', '每周', '每月', '每年', '隔天', '隔周', '隔月']
  for(const item of localList?.value) {
    const habitActivityList = await habitActivityController.getHabitActivityByTodoId(item.id);
    
    // 如果没有打卡记录，跳过
    if (!habitActivityList?.length) continue;
    
    // 获取所有已打卡的日期（YYYY-MM-DD）
    const clockInDates = new Set(
      habitActivityList.map(activity =>
        moment(activity.clockInTime).format('YYYY-MM-DD')
      )
    );
    
    // 第一条记录的日期（开始日期）
    const firstClockInDate = moment(habitActivityList[0].clockInTime);
    // 最后一条记录的日期（或今天，取较早的）
    const lastClockInDate = moment(habitActivityList[habitActivityList.length - 1].clockInTime);
    const today = moment();
    const endDate = moment.min(lastClockInDate, today);
    
    // 根据 repetition 计算日期增量
    const getIncrement = (repetition) => {
      switch (repetition) {
        case '每天': return { days: 1 };
        case '每周': return { days: 7 };
        case '每月': return { months: 1 };
        case '每年': return { years: 1 };
        case '隔天': return { days: 2 };
        case '隔周': return { days: 14 };
        case '隔月': return { months: 2 };
        default: return { days: 1 }; // 默认每天
      }
    };
    
    const increment = getIncrement(item.repetition);
    const expectedDates = [];
    
    // 生成所有预期打卡日期
    let currentDate = firstClockInDate.clone();
    while (currentDate.isSameOrBefore(endDate, 'day')) {
      expectedDates.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(increment);
    }
    
    // 找出缺失的日期（未打卡的）
    const missingDates = expectedDates.filter(date => !clockInDates.has(date));
    
    // 生成失败记录
    const failedRecords = missingDates.map(date => ({
      todoId: item.id,
      todoName: item.name,
      clockInTime: `${date} 23:59:59`, // 当天最后一秒
      status: '失败',
      createTime: `${date} 23:59:59`,
      updateTime: `${date} 23:59:59`,
    }));
    
    // 可以在这里把 failedRecords 存入数据库或进行其他操作
    if(!failedRecords?.length) { continue; }
    await habitActivityController.insertList(failedRecords);
  }
});

const handleBegin = async (todo) => {
  initWorkerHandle();
  resetTimer();
  startTimer();
  
  ChangeIsRunningHandle(true);
  updateTimingPopupHandle(true);
  todo.isTiming = true;
  todo.beginTime = moment().format('YYYY-MM-DD HH:mm');
  currentTodo.value = todo;
  
  await todoController.update(toRaw(todo));
}

const handleSetting = (todo) => {
  todoId.value = todo.id;
  ChangeCurrentTodoHandle(todo);
  updateTodoSettingPopupHandle(true);
}

// 彻底完成?
const isCompleted = async (todo) => {
  // 习惯项完成打卡活动记录
  if(todo.isHabit && todo.completed) {
    const habitActivity = new HabitActivity({
      createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      todoId: todo.id,
      todoName: todo.name,
      clockInTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      status: '成功'
    });
    await habitActivityController.update(habitActivity);
  }
  
  // 完成打卡的习惯项, 取消打卡, 并删除相应的习惯打卡活动记录
  if(todo.isHabit && !todo.completed) {
    const habitActivityList = await habitActivityController.getHabitActivityByClockInTime(moment().format('YYYY-MM-DD'));
    
    await habitActivityController.deleteById(habitActivityList[habitActivityList.length - 1].id);
  }
  
  await todoController.update(toRaw(todo));
}

const getTodoDetail = async (todo) => {
  handleTodoDetail(todo);
}
</script>

<style lang="scss" scoped>
.completed {
  text-decoration: line-through;
}

li {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px 5px 45px;
  margin: 5px 0;
  border-radius: 8px;
  font-size: 20px;
  background-color: #3286a8;
  
  .text {
    display: inline-block;
    word-wrap: break-word;
    flex: 1;
    cursor: pointer;
  }
  
  input {
    position: absolute;
    top: 10px;
    left: 8px;
    width: 20px;
    height: 20px;
  }
  
  button {
    position: relative;
    width: 50px;
    height: 35px;
    line-height: 35px;
    margin: 0 5px;
    color: #fff;
    text-align: center;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .begin {
    background-color: #16bc79;
  }
  
  .setting {
    background-color: #d7ba7d;
  }
  
  .get-detail {
    background-color: #2b3cd2;
  }
}
</style>
