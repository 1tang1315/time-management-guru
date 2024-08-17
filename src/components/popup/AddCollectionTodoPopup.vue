<template>
  <div class="addCollectionTodoPopup">
    <h4 class="title">{{ currentCollection.name }}</h4>
    <input type="text" v-model="collectionTodoText" placeholder="请输入任务项名称" @keyup.enter="addCollectionHandlerTodoInput">
    <button class="cancle" @click="addCollectionHandlerTodoCancel">X</button>
  </div>
</template>

<script setup>
import { ref, toRaw, inject } from 'vue';

import { collectionData } from '@/hooks/collectionData.js'
const { currentCollection, updateCollectionTodoPopupHandle, updateCollectionHandle, getCollectionHandle } = collectionData();

import { todoData } from '@/hooks/todoData';
const { getTodoHandle, addTodoHandle, updateTodoHandle } = todoData();

const collectionTodoText = ref('');
const updateCollections = inject('updateCollections');

const addCollectionHandlerTodoInput = async () => {
  const text = collectionTodoText.value.trim();
  if (!text) {
    alert("输入不能为空");
    return;
  }

  // 检查是否已经存在相同的 todo
  const isDuplicate = currentCollection.value.todos.some(t => t.text == text);
  if (isDuplicate) {
    alert('该todo项已经存在于当前合集。');
    return;
  }

  let todo = await getTodoHandle(text);
  if (todo) {
    if (window.confirm('当前todo项已存在, 是否移动到该合集?')) {
      if (todo.collection) {
        // 在合集内, 移出原合集
        const oldCollection = await getCollectionHandle(todo.collection);
        const updatedCollection = {
          ...oldCollection,
          todos: oldCollection.todos.filter(t => t.text !== todo.text)
        };
        await updateCollectionHandle(updatedCollection);
      }
      // 不在合集 在单项
      todo.collection = currentCollection.value.name;
      await updateTodoHandle(todo);
    } else {
      updateCollectionTodoPopupHandle(false);
      collectionTodoText.value = '';
      return;
    }
  } else {
    todo = {
      text,
      completed: false,
      collection: currentCollection.value.name,
      activities: []
    }
    await addTodoHandle(todo);
  }
  currentCollection.value.todos.push(todo);
  await updateCollectionHandle(toRaw(currentCollection.value));
  updateCollections();
  collectionTodoText.value = '';
  alert("操作成功!");
  updateCollectionTodoPopupHandle(false);
}
const addCollectionHandlerTodoCancel = () => {
  updateCollectionTodoPopupHandle(false);
}
</script>

<style lang="scss" scoped>
// 在集合中添加todo弹窗
.addCollectionTodoPopup {
  position: relative;
  width: 400px;
  height: 150px;
  background-color: #007acc;

  .title {
    text-align: center;
  }

  input {
    width: 350px;
    height: 30px;
    margin: 0 20px;
    padding: 5px;
    font-size: 20px;
    outline: none;
    border: none;
    border-radius: 5px;
  }

  .cancle {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 25px;
    height: 25px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }
}
</style>