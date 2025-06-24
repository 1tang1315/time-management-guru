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
import { ElMessage } from "element-plus";
import TodoSettingPopup from '@/components/popup/TodoSettingPopup.vue';
import { todoData } from '@/hooks/todoData';
import { timerWorkerData } from '@/hooks/timeWorkerData.js';
import { TodoController } from "@/db/controller/TodoController.js";
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
      ElMessage.error('更新失败');
      console.error("更新失败:", err);
    }
  }
  
  emit('updateTodoList', [...localList.value]);
}

watch(() => props.list, async (newList) => {
  localList.value = [...newList].sort((a, b) => a.order - b.order);
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
