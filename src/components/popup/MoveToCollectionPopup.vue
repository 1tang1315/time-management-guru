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
const { currentTodo, moveToCollectionPopup } = todoData();
const { updateTodoSettingPopupHandle, updateTodoHandle, ChangeMoveToCollectionPopupHandle } = todoData();

import { collectionData } from '@/hooks/collectionData';
const { updateCollectionHandle, getCollectionHandle } = collectionData();

const props = defineProps(['list']);
const updateTodos = inject('updateTodos');
const updateCollections = inject('updateCollections');

// 移动到单项 或者 合集
const handleMove = async (item) => {
  const todo = toRaw(currentTodo.value);
  if (todo.collection) {
    // 移动到其他合集
    const collection = await getCollectionHandle(todo.collection);
    collection.todos = collection.todos.filter(item => item.text !== todo.text);
    await updateCollectionHandle(collection);
  }
  todo.collection = item.name;
  item.todos.push(todo);
  await updateTodoHandle(todo);
  await updateCollectionHandle(toRaw(item));
  alert('移动成功!');
  ChangeMoveToCollectionPopupHandle(false);
  updateTodoSettingPopupHandle(false);
  updateTodos();
  updateCollections();
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