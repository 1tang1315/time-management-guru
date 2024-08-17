<template>
  <div class="overlay" v-if="todoSettingPopup" @click.self="handleCancel">
    <div class="todoSettingPopup">
      <h4 class="title">{{ currentTodo.text }}</h4>
      <div class="bottom">
          <div class="btn">
            <button class="add" @click="addTodoActivity">添加
            </button>
            <button class="move">移动
              <div class="dropdown">
                <li @click="moveToCollection">移动到合集</li>
                <li v-show="currentTodo.collection" @click="moveToTodos">移动到单项</li>
                <li>与其他待办合并</li>
              </div>
            </button>
            <button class="delete" @click="deleteTodoHandler">删除</button>
          </div>
        <div class="totalData">
          <h4>累计数据</h4>
          <div class="data">
            <dl>
              <dt>专注次数</dt>
              <dd>{{ currentTodo.activities.length }}</dd>
            </dl>
            <dl>
              <dt>总时长</dt>
              <dd>{{ totalDuration }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
  <teleport to='body'>
    <MoveToCollection :list="collections" />
  </teleport>
</template>

<script setup>
import { toRaw, computed, inject, ref } from 'vue';
import MoveToCollection from '@/components/popup/MoveToCollectionPopup.vue';

import { todoData } from '@/hooks/todoData.js';
const { currentTodo, todoSettingPopup } = todoData();
const { updateTodoSettingPopupHandle, updateTodoActivityPopupHandle, getAllTododsHandle, updateTodoHandle, removeTodoByTextHandle, ChangeMoveToCollectionPopupHandle } = todoData();

import { collectionData } from '@/hooks/collectionData';
const { getCollectionHandle, getAllCollectionsHandle, updateCollectionHandle, ChangeCurrentCollectionHandle } = collectionData();

const props = defineProps(['todo']);
const updateTodos = inject('updateTodos');
const updateCollections = inject('updateCollections');
const collections = ref([]);

const totalDuration = computed(() => {
  const totalMinutes = currentTodo.value.activities.reduce((sum, activity) => sum + Number(activity.duration), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}小时${minutes}分钟`;
});

const moveToCollection = async () => {
  ChangeMoveToCollectionPopupHandle(true);
  collections.value = await getAllCollectionsHandle();
}
const moveToTodos = async () => {
  const todo = toRaw(currentTodo.value);
  const collection = await getCollectionHandle(todo.collection);
  collection.todos = collection.todos.filter(item => item.text !== todo.text);
  todo.collection = '';
  await updateCollectionHandle(collection);
  await updateTodoHandle(todo);
  updateCollections();

  alert("移动成功");
  updateTodoSettingPopupHandle(false);
}

const handleCancel = () => {
  updateTodoSettingPopupHandle(false);
}

const addTodoActivity = () => {
  updateTodoActivityPopupHandle(true);
}

// 彻底删除(删除todo 保留activities)
const deleteTodoHandler = async () => {
  if (window.confirm("你确定要删除这个项目吗？")) {
    // 处理彻底删除
    if (currentTodo.value.collection) {
      const collection = await getCollectionHandle(currentTodo.value.collection);
      collection.todos = collection.todos.filter((todo) => todo.text !== currentTodo.value.text);
      await updateCollectionHandle(collection);
      updateCollections();
    }
    await removeTodoByTextHandle(currentTodo.value.text);
    const newTodos = await getAllTododsHandle();
    updateTodos(newTodos);
    updateTodoSettingPopupHandle(false);
  }
}
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.todoSettingPopup {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 240px;
  padding: 5px 10px;
  border-radius: 10px;
  background-color: #60abc2;

  .title {
    margin: 15px 0;
    text-align: center;
  }

  .bottom {
    padding: 10px;
    border-radius: 10px;
    background-color: #ddd;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    border-radius: 10px;
    background-color: #60abc2;

    button {
      position: relative;
      width: 100px;
      height: 35px;
      line-height: 35px;
      margin: 0 5px;
      color: aqua;
      background-color: #abcad5;
      text-align: center;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .move {
      position: relative;

      &:hover .dropdown {
        display: block;
      }

      .dropdown {
        display: none;
        position: absolute;
        left: 109px;
        top: -35px;
        width: 180px;
        border-radius: 10px;
        color: #000;
        background-color: #fff;
        z-index: 100;

        &::before {
          content: "";
          position: absolute;
          top: 50%;
          left: -9px;
          transform: translateY(-50%);
          border-width: 10px 10px 10px 0;
          border-style: solid;
          border-color: transparent #fff transparent transparent;
        }

        li {
          margin: 5px 2px;
          &:not(:last-child) {
            border-bottom: 1px solid #b0bbbe;
          }

          &:hover {
            background-color: #60abc2;
          }
        }
      }
    }

    .delete {
      color: red;
      background-color: #d6bfbf;
    }

  }

  .detailData {
    width: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: space-around;

    button {
      position: relative;
      width: 190px;
      height: 35px;
      line-height: 35px;
      margin: 0 5px;
      color: aqua;
      background-color: #abcad5;
      text-align: center;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  }

  .totalData {
    margin-top: 10px;
    padding: 10px;
    border-radius: 10px;
    background-color: #60abc2;

    h4 {
      margin: 0;
    }

    .data {
      display: flex;
      justify-content: space-around;
      text-align: center;

      dl {
        width: 40%;
        margin: 0;

        dd {
          margin: 0;
        }
      }
    }
  }
}
</style>