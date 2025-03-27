<template>
  <div class="overlay" v-show="moveToCollectionPopup" @click.self="handleCancel">
    <div class="moveToCollection">
      <li v-for="item in list.filter(item => item.name !== currentTodo.collection)" @click="handleMove(item)">
        {{ item.name }}
      </li>
    </div>
  </div>
</template>

<script setup>
import { toRaw, inject } from 'vue';
import { todoData } from '@/hooks/todoData.js';
import { TodoController } from "@/db/controller/TodoController.js";
import { ElMessage } from "element-plus";

const todoController = new TodoController();
const { currentTodo, moveToCollectionPopup } = todoData();
const {
  updateTodoSettingPopupHandle,
  ChangeMoveToCollectionPopupHandle
} = todoData();

const props = defineProps(['list']);
const updateTodoList = inject('updateTodoList');
const updateCollectionList = inject('updateCollectionList');

// 移动到单项 或者 合集
const handleMove = async (item) => {
  const todo = toRaw(currentTodo.value);
  todo.collectionId = item.id;

  await todoController.update(todo);

  ElMessage.success('移动成功');
  ChangeMoveToCollectionPopupHandle(false);
  updateTodoSettingPopupHandle(false);
  await updateTodoList();
  await updateCollectionList();
}
const handleCancel = () => {
  ChangeMoveToCollectionPopupHandle(false);
}
</script>

<style lang="scss" scoped>
.moveToCollection {
  width: 250px;
  height: 250px;
  padding: 10px;
  color: #333;
  overflow-y: auto;
  border-radius: 8px;
  background-color: #fff;

  li {
    padding: 5px 10px;
    margin: 5px 0;
    border-radius: 8px;
    background-color: #ccc;
    cursor: pointer;
  }
}
</style>