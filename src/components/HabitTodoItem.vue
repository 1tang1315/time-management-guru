<template>
  <div class="calendar-container">
    <el-calendar
      ref="calendarRef"
      class="calendar"
      :range="currentRange"
    >
      <template #header="{ date }">
        <div class="calendar-header">
          <span class="header-date">{{ currentDate.format('YYYY年M月') }}</span>
          <el-button-group>
            <el-button size="small" @click="selectDate('today')">今天</el-button>
            <el-button size="small" @click="selectDate('prev')">{{ isExpanded ? '上月' : '上周' }}</el-button>
            <el-button size="small" @click="selectDate('next')">{{ isExpanded ? '下月' : '下周' }}</el-button>
          </el-button-group>
        </div>
      </template>
      <template #date-cell="{ data }">
        <div
          :class="{
                  'current-month': isCurrentMonth(data.day),
                  'other-month': !isCurrentMonth(data.day)
                }"
          @click="selectedDay(data.day)"
        >{{ data.day.split('-')[2] }}
        </div>
      </template>
    </el-calendar>
    
    <div class="calendar-toggle" @click="isExpanded = !isExpanded">
      <span>{{ isExpanded ? '收起至周视图' : '展开至月视图' }}</span>
      <el-icon>
        <arrow-down v-show="!isExpanded"/>
        <arrow-up v-show="isExpanded"/>
      </el-icon>
    </div>
  </div>
  
  <draggable :list="dayHabitList" item-key="id" :move="onMove">
    <template #item="{ element: item }">
      <li :key="item.todoId">
        <input :id="item.todoName" type="checkbox" v-model="item.status" @change="changeStatus(item)">
        <label :for="item.todoName" :class="{ 'completed': item.status }" class="text">{{ item.todoName }}</label>
        <button class="begin" @click="handleBegin(item.todoId)">开始</button>
        <button class="get-detail" @click="getTodoDetail(item.todoId)" v-if="page === 'guide'">详情</button>
        <button class="setting" @click="handleSetting(item.todoId)">设置</button>
      </li>
    </template>
  </draggable>
  
  <teleport to='body'>
    <TodoSettingPopup v-if="todoSettingPopup" :todoId="todoId"/>
  </teleport>
</template>

<script setup>
import {
  ref,
  onMounted,
  computed,
  toRaw,
  inject
} from 'vue';
import draggable from 'vuedraggable';
import { ElMessage } from "element-plus";
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import TodoSettingPopup from '@/components/popup/TodoSettingPopup.vue';
import { todoData } from '@/hooks/todoData';
import { timerWorkerData } from '@/hooks/timeWorkerData.js';
import { TodoController } from "@/db/controller/TodoController.js";
import { HabitActivityController } from "@/db/controller/HabitActivityController.js";
import { HabitActivity } from "../db/model/HabitActivity.js";
import moment from 'moment';

const { currentTodo, todoSettingPopup } = todoData();
const {
  ChangeCurrentTodoHandle,
  updateTodoSettingPopupHandle,
  updateTimingPopupHandle
} = todoData();

const {
  ChangeIsRunningHandle,
  initWorkerHandle,
  startTimer,
  resetTimer
} = timerWorkerData();

const todoController = new TodoController();
const habitActivityController = new HabitActivityController();

const props = defineProps(['page']);
const emit = defineEmits(['updateTodoList']);
const handleTodoDetail = inject('handleTodoDetail', todo => {
});

const todoId = ref('');
const localList = ref([]);
const dayHabitList = ref([]);

onMounted(async () => {
  const today = moment().format('YYYY-MM-DD');
  const lastLoginDay = localStorage.getItem('lastLoginDay') || today;
  
  let date = moment(lastLoginDay);
  const end = moment(today);
  
  // 当天
  if(date.isSame(end, 'day')) {
    await addHabitActivity(today)
  }
  
  // 补充缺失日期(未登录日期)
  while (date.isBefore(end)) {
    const dayStr = date.add(1, 'day').format('YYYY-MM-DD');
    
    await addHabitActivity(dayStr);
  }
  
  dayHabitList.value = await habitActivityController.getHabitActivityListByClockInDay(today);
  
  localStorage.setItem('lastLoginDay', today); // 更新本次登录时间
});

async function addHabitActivity(dayStr) {
  const habitList = await todoController.getTodoHabitList();
  
  const dayData = await habitActivityController.getHabitActivityListByClockInDay(dayStr) || [];
  
  for (const habit of habitList) {
    if(dayStr < habit.beginHabitTime || dayStr >= habit.stopRepetitionTime) continue;
    
    const exists = dayData.some(item => item.todoId === habit.id);
    if (exists) continue;
    
    if (habit.stopRepetitionTime === '无' || habit.stopRepetitionTime) {
      const habitActivityObj = new HabitActivity({
        todoId: habit.id,
        todoName: habit.name,
        clockInDay: dayStr,
        status: false,
        count: 1
      });
      await habitActivityController.add(habitActivityObj);
    }
  }
}

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
      ElMessage.error('更新失败');
      console.error("更新失败:", err);
    }
  }
  
  emit('updateTodoList', [...localList.value]);
}

const handleBegin = async (todoId) => {
  const todo = await todoController.getById(todoId);
  
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

const handleSetting = async (todoId) => {
  const todo = await todoController.getById(todoId);
  
  ChangeCurrentTodoHandle(todo);
  updateTodoSettingPopupHandle(true);
}

const changeStatus = async (todoHabitActivity) => {
  if(todoHabitActivity.clockInDay > moment().format("YYYY-MM-DD")) {
    ElMessage.warning("时间还没到, 不要着急打卡哦~");
    todoHabitActivity.status = false;
    return;
  }
  
  await habitActivityController.update({ ...todoHabitActivity });
}

const getTodoDetail = async (todoId) => {
  const todo = await todoController.getById(todoId);
  handleTodoDetail(todo);
}

// 日历
const isExpanded = ref(false);
const calendarRef = ref(null);
const currentDate = ref(moment());

// 计算当前范围
const currentRange = computed(() => {
  if(isExpanded.value) {
    // 月视图
    return [
      currentDate.value.clone().startOf('month').toDate(),
      currentDate.value.clone().endOf('month').toDate()
    ];
  } else {
    // 周视图
    return [
      currentDate.value.clone().startOf('week').toDate(),
      currentDate.value.clone().endOf('week').toDate()
    ]
  }
})

const selectDate = (type) => {
  switch(type) {
    case 'today':
      currentDate.value = moment();
      break;
    case 'prev':
      currentDate.value = isExpanded.value
        ? currentDate.value.clone().subtract(1, 'month')
        : currentDate.value.clone().subtract(1, 'week');
      break;
    case 'next':
      currentDate.value = isExpanded.value
        ? currentDate.value.clone().add(1, 'month')
        : currentDate.value.clone().add(1, 'week');
      break;
  }
}

// 改变日期生成 展示当日打卡项
const selectedDay = async (day) => {
  await addHabitActivity(day);
  dayHabitList.value = await habitActivityController.getHabitActivityListByClockInDay(day);
}

// 判断日期是否属于当前月
const isCurrentMonth = (dateString) => {
  const cellDate = moment(dateString);
  return cellDate.month() === currentDate.value.month();
}
</script>

<style lang="scss" scoped>
.calendar-container {
  width: 100%;
  
  .calendar {
    border-radius: 8px;
    
    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    
    .other-month {
      color: #999999;
    }
  }
  
  .calendar-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 10px 0;
  }
}

:deep(.el-calendar__header) {
  padding: 10px;
  color: #0a0a0a;
}

:deep(.el-button-group) {
  border: 1px solid #0a0a0a;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-button) {
  margin: 0;
  padding: 10px;
  height: 25px;
  line-height: 25px;
  color: #0a0a0a;
  
  &:nth-child(2) {
    border-left: 1px solid #0a0a0a;
    border-right: 1px solid #0a0a0a;
    z-index: 100;
  }
}

:deep(.el-calendar__body) {
  padding: 10px;
  color: #333232;
}

:deep(.el-calendar-table th) {
  text-align: center;
}

:deep(.el-calendar-day) {
  width: 20px;
  height: 20px;
  margin: auto;
  padding: 0;
  text-align: center;
}

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
