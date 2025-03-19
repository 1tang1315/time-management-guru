<template>
  <h1 class="title">当日指南(目标|复盘)</h1>
  
  <div class="todo">
    <div class="nav">
      <button class="addOne" :class="inputIndex === 0 ? 'input-active' : ''" @click="toOneHandler">单个任务项</button>
      <button class="addCollection" :class="inputIndex === 1 ? 'input-active' : ''" @click="toCollectionHandler">合集
      </button>
    </div>
    
    <input class="add-todo" v-if="inputIndex === 0" v-model="todoName" @keyup.enter="addTodoHandler"
           placeholder="请输入单个专注项或计划">
    <input class="add-todo" v-else v-model="collectionName" @keyup.enter="addTodoCollectionHandler"
           placeholder="请输入合集名称">
    
    <ul v-if="inputIndex === 0" class="oneContent">
      <TodoItem :todos="todos" :page="page"/>
    </ul>
    
    <div v-if="inputIndex === 1" class="collections">
      <draggable :list="collections" item-key="name" :move="onMove">
        <template #item="{ element: collection }">
          <div class="collection" :key="collection.name">
            <div class="collection-header" @click="foldHandler(collection)">
              <h3 class="collection-header-title">{{ collection.name }}</h3>
              <div class="collection-header-content">
                <button class="delete" @click="handleDelete(collection)">删除</button>
                <button class="release" @click="handleRelease(collection)">释放</button>
                <button class="complete" @click="handleComplete(collection)">完成</button>
                <button class="add" @click="addCollectionTodoHandler(collection)">+</button>
                <span class="arrow" :class="!collection.isFolded ? 'arrow-open' : 'arrow-close'"></span>
              </div>
            </div>
            
            <ul class="collection-body" v-if="!collection.isFolded">
              <TodoItem :todos="collectionTodoList" :page="page"/>
            </ul>
          </div>
        </template>
      </draggable>
    </div>
  </div>
  <!-- 计时弹窗 -->
  <teleport to='body'>
    <div class="overlay" v-show="timingPopup">
      <TimingPopup/>
    </div>
  </teleport>
  
  <!-- 添加计时活动弹窗 -->
  <teleport to='body'>
    <div class="overlay" v-if="addTodoActivityPopup">
      <AddTodoActivityPopup/>
    </div>
  </teleport>
  <!-- 在集合中添加 todo弹窗 -->
  <teleport to='body'>
    <div class="overlay" v-if="addCollectionTodoPopup">
      <AddCollectionTodoPopup :currentCollection="currentCollection"/>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted, toRaw, provide } from 'vue';
import draggable from 'vuedraggable';
import TodoItem from '@/components/TodoItem.vue';
import AddCollectionTodoPopup from '@/components/popup/AddCollectionTodoPopup.vue';
import AddTodoActivityPopup from '@/components/popup/AddTodoActivityPopup.vue';
import TimingPopup from '@/components/popup/TimingPopup.vue';

import { Todo } from '@/db/model/Todo.js';

import { todoData } from '@/hooks/todoData';

const { addTodoActivityPopup, timingPopup } = todoData();

import { collectionData } from '@/hooks/collectionData.js'
import { Collection } from "@/db/model/Collection.js";

const { addCollectionTodoPopup } = collectionData();
const {
  updateCollectionTodoPopupHandle,
  addCollectionHandle
} = collectionData();

import { TodoController} from "@/db/controller/TodoController.js";
import { CollectionController} from "@/db/controller/CollectionController.js";

const todoController = new TodoController();
const collectionController = new CollectionController();

const emit = defineEmits(['todoDetail']);
const props = defineProps(['page'])

const inputIndex = ref(0);
const collectionName = ref('');

const todoName = ref('');
const todos = ref([]);
const collectionTodoList = ref([]);
const collections = ref([]);

onMounted(async () => {
  todos.value = await todoController.getList();
  collections.value = await collectionController.getList();
});

const onMove = async (evt) => {
  const { index, futureIndex } = evt.draggedContext;
  
  if(index !== futureIndex) {
    const draggedElement = collections.value[index];
    const targetElement = collections.value[futureIndex];
    
    const changeOrder = draggedElement.order;
    draggedElement.order = targetElement.order;
    targetElement.order = changeOrder;
    
    await collectionController.update(toRaw(draggedElement));
    await collectionController.update(toRaw(targetElement));
  }
}

// 更新todos(处理子组件的数据更新请求)
const updateTodos = async () => {
  todos.value = await todoController.getList();
}
// 更新updateCollection(处理子组件的合集数据更新)
const updateCollections = async () => {
  collections.value = await collectionController.getList();
}
provide('updateTodos', updateTodos);
provide('updateCollections', updateCollections);

const toOneHandler = async () => {
  inputIndex.value = 0;
  todos.value = await todoController.getList();
}
// 导航切换为合集, 并获取collections最新数据
const toCollectionHandler = async () => {
  inputIndex.value = 1;
  collections.value = await collectionController.getList();
}

// 处理合集的折叠
const foldHandler = async (collection) => {
  collectionTodoList.value = [];
  collection.isFolded = !collection.isFolded;
  
  if(!collection.isFolded) {
    collectionTodoList.value = await todoController.getTodoByCollectionId(collection.id);
    
    collections.value.filter(item => {
      if(item.id !== collection.id) {
        item.isFolded = true;
      }
    });
  }
}
// 处理添加合集
const addTodoCollectionHandler = async () => {
  if(!collectionName.value.trim()) {
    alert("添加内容不能为空");
    return;
  }
  
  const collectionObj = new Collection({
    name: collectionName.value.trim(),
    order: collections.value.length,
    isFolded: true
  });
  
  await addCollectionHandle(collectionObj);
  collections.value = await collectionController.getList();
  collectionName.value = '';
}
// 添加合集 单项 +
const currentCollection = ref();
const addCollectionTodoHandler = (item) => {
  updateCollectionTodoPopupHandle(true);
  currentCollection.value = item;
}

// 添加 todo 单项
const addTodoHandler = async () => {
  if(!todoName.value.trim()) {
    alert("添加内容不能为空");
    return;
  }
  
  if(todoName.value) {
    const todoObj = new Todo({
      name: todoName.value.trim(),
      completed: false
    });
    
    try {
      await todoController.add(todoObj);
      todos.value = await todoController.getList();
      todoName.value = '';
    } catch(e) {
      alert(e.message);
    }
  }
}

const handleComplete = async (collection) => {
  if(confirm('是否已彻底完成该合集?')) {
    collection.completed = true;
    await collectionController.update(toRaw(collection));
    await updateCollections();
  }
}

const handleRelease = async (collection) => {
  if(confirm('该操作会将内部所有的todo项移除该合集')) {
    const todoList = await todoController.getTodoByCollectionId(collection.id);
    for(const item of todoList) {
      item.collectionId = '';
      await todoController.update(item);
    }
    alert('释放成功!!!');
    await updateCollections();
  }
}
const handleDelete = async (collection) => {
  if(confirm('释放彻底删除该合集以及关联的todo项?')) {
    const todoList = await todoController.getTodoByCollectionId(collection.id);
    for(const item of todoList) {
      await todoController.deleteById(item.id);
    }
    await collectionController.deleteById(collection.id);
    alert('删除成功!!!');
    await updateCollections();
  }
}
</script>

<style lang="scss" scoped>
.input-active {
  background-color: #a8ebfe;
}

.title {
  text-align: center;
  font-size: 20px;
}

.add-todo {
  width: 380px;
  height: 20px;
  margin: 0 44px;
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  outline: none;
  font-size: 20px;
}

.todo {
  width: 100%;
  height: 380px;
  
  .nav {
    width: 100%;
    margin: 5px 0;
    display: flex;
    justify-content: center;
    
    .addOne,
    .addCollection {
      margin: 0 5px;
      border-radius: 5px;
      cursor: pointer;
      
      &:hover {
        background-color: #a8ebfe;
      }
    }
  }
}

// 单项
.oneContent {
  width: 380px;
  height: 360px;
  overflow: auto;
  margin: 5px 55px;
}

// 合集
.collections {
  width: 380px;
  height: 360px;
  overflow: auto;
  margin: 0 55px;
  
  .collection {
    margin: 5px 0;
    
    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      padding: 0 10px;
      line-height: 40px;
      border-radius: 5px;
      background-color: #ccc;
      
      &-title {
        margin: 5px 0;
        text-align: left;
        cursor: pointer;
      }
      
      &-content {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        
        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 25px;
          margin: 0 4px;
          color: var(--text-color);
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        
        .delete {
          background-color: #f82828;
        }
        
        .release {
          background-color: #ffd900;
        }
        
        .complete {
          background-color: #d7ba7d;
        }
        
        .add {
          width: 40px;
          border-radius: 5px;
          background-color: #16bc79;
          cursor: pointer;
        }
        
        .arrow {
          width: 0;
          height: 0;
          transition: transform 0.3s;
        }
        
        .arrow-open {
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-bottom: 7px solid #fff;
        }
        
        .arrow-close {
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 7px solid #fff;
        }
      }
    }
    
    &-body {
      margin: 0;
      width: 100%;
    }
  }
}
</style>