<template>
  <div class="addCollectionTodoPopup">
    <h4 class="title">{{ currentCollection.name }}</h4>
    <input type="text" v-model="collectionTodoName" placeholder="请输入任务项名称"
           @keyup.enter="addCollectionHandlerTodoInput">
    <button class="cancle" @click="addCollectionHandlerTodoCancel">X</button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue';
import { collectionData } from '@/hooks/collectionData.js'

const {
  updateCollectionTodoPopupHandle,
} = collectionData();

const collectionTodoName = ref('');
const updateCollections = inject('updateCollections');

import { TodoController } from "@/db/controller/TodoController.js";
import { Todo } from "@/db/model/Todo.js";

const todoController = new TodoController();

const { currentCollection } = defineProps(['currentCollection']);

const addCollectionHandlerTodoInput = async () => {
  const name = collectionTodoName.value.trim();
  
  if(!name) {
    alert("输入不能为空");
    return;
  }
  
  let todo = await todoController.getTodoByTodoName(name);
  
  if(todo?.collectionId === currentCollection.id) {
    alert('该todo项已经存在于当前合集。');
    return;
  }
  
  if(todo && window.confirm('当前todo项已存在, 是否移动到该合集?')) {
    todo.collectionId = currentCollection.id;
    await todoController.update(todo);
  }
  
  if(!todo) {
    todo = new Todo({
      name,
      collectionId: currentCollection.id
    });
    
    await todoController.add(todo);
  }
  
  collectionTodoName.value = '';
  alert("操作成功!");
  updateCollectionTodoPopupHandle(false);
  await updateCollections();
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