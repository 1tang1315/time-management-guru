<template>
  <draggable :list="localTodos" item-key="text" :move="onMove">
    <template #item="{ element: todo }">
      <li :key="todo.text">
        <input :id="todo.text" type="checkbox" v-model="todo.completed" @change="isCompleted(todo)">
        <label :for="todo.text" :class="{ 'completed': todo.completed }" class="text">{{ todo.text }}</label>
        <button class="begin" :disabled="todo.isUnderway" @click="handleBegin(todo)">开始</button>
        <button class="get-detail" @click="getTodoDetail(todo)" v-if="page == 'guide'">详情</button>
        <button class="setting" @click="handleSetting(todo)">设置</button>
      </li>
    </template>
  </draggable>
  <teleport to='body'>
    <TodoSettingPopup />
  </teleport>
</template>

<script setup>
import { ref, watch, toRaw, onMounted, inject } from 'vue';
import draggable from 'vuedraggable';
import TodoSettingPopup from '@/components/popup/TodoSettingPopup.vue';

import { todoData } from '@/hooks/todoData';
const { currentTodo } = todoData();
const { ChangeCurrentTodoHandle, updateTodoSettingPopupHandle, updateTodoHandle, updateTimingPopupHandle } = todoData();

import { timerWorkerData } from '@/hooks/timeWorkerData.js';
const { ChangeIsRunningHandle, initWorkerHandle, startTimer, resetTimer } = timerWorkerData();

import { collectionData } from '@/hooks/collectionData.js';
const { getCollectionHandle, updateCollectionHandle } = collectionData();

import moment from 'moment';

const props = defineProps(['todos', 'page']);
const emit = defineEmits(['updateTodos']);
const handletodoDetail = inject('handletodoDetail', () => {});

const localTodos = ref([]);
onMounted(() => {
  localTodos.value = [...props.todos].sort((a, b) => a.order - b.order);
});

const onMove = async (evt) => {
  const { index, futureIndex } = evt.draggedContext;

  if (index !== futureIndex) {
    const draggedElement = localTodos.value[index];
    const targetElement = localTodos.value[futureIndex];

    const changeOrder = draggedElement.order;
    draggedElement.order = targetElement.order;
    targetElement.order = changeOrder;

    if (draggedElement.collection) {
      const collectionElement = await getCollectionHandle(draggedElement.collection);
      collectionElement.todos = JSON.parse(JSON.stringify(toRaw(localTodos.value)));
      await updateCollectionHandle(toRaw(collectionElement));
    }
    await updateTodoHandle(toRaw(draggedElement));
    await updateTodoHandle(toRaw(targetElement));
  }

  emit('updateTodos', [...localTodos.value]);
}

watch(() => props.todos, (newTodos) => {
  localTodos.value = [...newTodos].sort((a, b) => a.order - b.order);
});

const handleBegin = async (todo) => {
  initWorkerHandle();
  resetTimer();
  startTimer();

  ChangeIsRunningHandle(true);
  updateTimingPopupHandle(true);
  todo.isUnderway = true;
  todo.beginDate = moment().format('YYYY-MM-DD HH:mm');
  currentTodo.value = todo;

  await updateTodoHandle(toRaw(todo));
}
const handleSetting = (todo) => {
  ChangeCurrentTodoHandle(todo);
  updateTodoSettingPopupHandle(true);
}

// 彻底完成?
const isCompleted = async (todo) => {
  await updateTodoHandle(toRaw(todo));
}

const getTodoDetail = async (todo) => {
  handletodoDetail(todo);
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
