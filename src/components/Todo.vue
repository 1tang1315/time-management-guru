<template>
  <h1 class="title">当日指南(目标|复盘)</h1>
  <div class="todo">
    <div class="nav">
      <button class="addOne" :class="inputIndex == 0 ? 'input-active' : ''" @click="addOneHandler">单个任务项</button>
      <button class="addCollection" :class="inputIndex == 1 ? 'input-active' : ''" @click="addCollectionHandler">合集</button>
    </div>
    <input class="add-todo" v-if="inputIndex == 0" v-model="newTodoText" @keyup.enter="addTodoHandler" placeholder="请输入单个专注项或计划">
    <input class="add-todo" v-else v-model="newTodoCollection" @keyup.enter="addTodoCollectionHandler" placeholder="请输入合集名称">
    <ul v-if="inputIndex == 0" class="oneContent">
      <TodoItem :todos="todos" :page="page" />
    </ul>
    <div v-if="inputIndex == 1" class="collections">
      <draggable :list="collections" item-key="name" :move="onMove">
        <template #item="{ element: collection }">
          <div class="collection" :key="collection.name">
            <h4 class="title" @click="foldHandler(collection)">{{ collection.name }}</h4>
            <span class="arrow" :class="!collection.isFold ? 'arrow-open' : 'arrow-close'"></span>
            <span class="add" @click="addCollectionTodoHandler(collection)">+</span>
            <ul class="content" v-if="!collection.isFold">
              <TodoItem :todos="collection.todos" :page="page"/>
            </ul>
          </div>
        </template>
      </draggable>
    </div>
  </div>
  <!-- 计时弹窗 -->
  <teleport to='body'>
    <div class="overlay" v-show="timingPopup">
      <TimingPopup />
    </div>
  </teleport>
  
  <!-- 添加计时活动弹窗 -->
  <teleport to='body'>
    <div class="overlay" v-if="addTodoActivityPopup">
      <AddTodoActivityPopup />
    </div>
  </teleport>
  <!-- 在集合中添加 todo弹窗 -->
  <teleport to='body'>
    <div class="overlay" v-if="addCollectionTodoPopup">
      <AddCollectionTodoPopup />
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

import { todoData } from '@/hooks/todoData';
const { addTodoActivityPopup, timingPopup } = todoData();
const { getAllTododsHandle, addTodoHandle } = todoData();

import { collectionData } from '@/hooks/collectionData.js'
const { addCollectionTodoPopup} = collectionData();
const { getAllCollectionsHandle, updateCollectionTodoPopupHandle, updateCollectionHandle, addCollectionHandle, ChangeCurrentCollectionHandle } = collectionData();

const emit = defineEmits(['todoDetail']);
const props = defineProps(['page'])

const inputIndex = ref(0); 
const newTodoCollection = ref('');

const newTodoText = ref('');
const todos = ref([]);
const collections = ref([]);

onMounted(async () => {
  todos.value = await getAllTododsHandle();
  collections.value = await getAllCollectionsHandle();
});

const onMove = async (evt) => {
  const { index, futureIndex } = evt.draggedContext;

  if (index !== futureIndex) {
    const draggedElement = collections.value[index];
    const targetElement = collections.value[futureIndex];

    const changeOrder = draggedElement.order;
    draggedElement.order = targetElement.order;
    targetElement.order = changeOrder;

    await updateCollectionHandle(toRaw(draggedElement));
    await updateCollectionHandle(toRaw(targetElement));
  }
}


// 更新todos(处理子组件的数据更新请求)
const updateTodos = async () => {
  todos.value = await getAllTododsHandle();
}
// 更新updateCollection(处理子组件的合集数据更新)
const updateCollections = async () => {
  collections.value = await getAllCollectionsHandle();
}
provide('updateTodos', updateTodos);
provide('updateCollections', updateCollections);

const addOneHandler = async () => {
  inputIndex.value = 0;
  todos.value = await getAllTododsHandle();
}
// 导航切换为合集, 并获取collections最新数据
const addCollectionHandler = async () => {
  inputIndex.value = 1;
  collections.value = await getAllCollectionsHandle();
}
// 处理合集的折叠
const foldHandler = async (item) => {
  collections.value.forEach(async collection => {
    if (collection !== item && !collection.isFold) {
      collection.isFold = true;
      await updateCollectionHandle(toRaw(collection));
    }
  })
  item.isFold = !item.isFold;
  ChangeCurrentCollectionHandle(item);
  await updateCollectionHandle(toRaw(item));
}
// 处理添加合集
const addTodoCollectionHandler = async () => { 
  if (!newTodoCollection.value.trim()) {
    alert("添加内容不能为空");
    return;
  }
  const collectionObj = {
    name: newTodoCollection.value.trim(),
    order: collections.value.length,
    isFold: true,
    todos: []
  }

  await addCollectionHandle(collectionObj);
  collections.value = await getAllCollectionsHandle();
  newTodoCollection.value = '';
}
// 添加合集 单项 +
const addCollectionTodoHandler = (item) => {
  updateCollectionTodoPopupHandle(true);
  ChangeCurrentCollectionHandle(item);
}

const addTodoHandler = async () => {
  if (!newTodoText.value.trim()) {
    alert("添加内容不能为空");
    return;
  }
  if (newTodoText.value) {
    const data = {
      text: newTodoText.value.trim(),
      completed: false,
      collection: [],
      activities: []
    }
    try {
      await addTodoHandle(data);
      todos.value = await getAllTododsHandle();
      newTodoText.value = '';
    } catch (e) {
      alert(e.message);
    }
  }
}
</script>

<style lang="scss" scoped>
.input-active {
    background-color: #a8ebfe;
}

.arrow-open {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #fff;
}
.arrow-close {
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #fff;
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
      position: relative;
      .title {
        height: 40px;
        line-height: 40px;
        margin: 5px 0;
        text-align: left;
        padding: 0 10px;
        border-radius: 5px;
        background-color: #ccc;
        cursor: pointer;
      }
      .arrow {
        position: absolute;
        right: 15px;
        top: 18px;
        width: 0;
        height: 0;
        transition: transform 0.3s;
      }
      .add {
        position: absolute;
        right: 50px;
        top: 10px;
        width: 40px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        border-radius: 5px;
        background-color: #16bc79;
        cursor: pointer;
      }

      .content {
        margin: 0;
        width: 100%;
      }
  }
}
</style>