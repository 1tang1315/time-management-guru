<template>
  <div class="overlay" @click.self="handleCancel">
    <div class="todoSettingPopup">
      <h4 class="title">{{ currentTodo.name }}</h4>
      
      <div class="content">
        <div class="btn">
          <button class="add" @click="addTodoActivity">添加
          </button>
          <button class="habit" @click="habitHandle">习惯打卡
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
              <dd>{{ currentTodoActivity?.length }}</dd>
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
    <MoveToCollection :list="collectionList"/>
  </teleport>
  <teleport to='body'>
    <div class="overlay" v-if="todoHabitPopup">
      <HabitPopup v-if="todoHabitPopup"/>
    </div>
  </teleport>
</template>

<script setup>
import { toRaw, computed, inject, ref, onMounted } from 'vue';
import MoveToCollection from '@/components/popup/MoveToCollectionPopup.vue';
import HabitPopup from "@/components/popup/TodoHabitPopup.vue";
import { TodoController } from "@/db/controller/TodoController.js";
import { CollectionController } from "@/db/controller/CollectionController.js";
import { todoData } from '@/hooks/todoData.js';
import { ElMessage, ElMessageBox } from "element-plus";

const {
  currentTodo,
  todoHabitPopup,
  updateTodoSettingPopupHandle,
  updateTodoActivityPopupHandle,
  ChangeMoveToCollectionPopupHandle,
  updateTodoHabitPopupHandle
} = todoData();

const todoController = new TodoController();
const collectionController = new CollectionController();

const props = defineProps(['todo', 'todoId']);

const updateTodoList = inject('updateTodoList');
const collectionList = ref([]);

const currentTodoActivity = ref([]);
onMounted(async () => {
  currentTodoActivity.value = await todoController.getTodoActivity(props.todoId);
});

const totalDuration = computed(() => {
  if(currentTodoActivity.value.length <= 0) {
    return '0小时0分钟';
  }
  
  const totalMinutes = currentTodoActivity.value.reduce((sum, activity) => sum + Number(activity.duration), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}小时${minutes}分钟`;
});

const moveToCollection = async () => {
  ChangeMoveToCollectionPopupHandle(true);
  collectionList.value = await collectionController.getList();
}
const moveToTodos = async () => {
  const todo = toRaw(currentTodo.value);
  todo.collectionId = '';
  await todoController.update(todo);
  
  ElMessage.success('移动成功');
  updateTodoSettingPopupHandle(false);
}

const handleCancel = () => {
  updateTodoSettingPopupHandle(false);
}

const addTodoActivity = () => {
  updateTodoActivityPopupHandle(true);
}

const habitHandle = () => {
  updateTodoHabitPopupHandle(true);
}

// 彻底删除(删除todo 保留activities)
const deleteTodoHandler = async () => {
  await ElMessageBox.confirm(
    '你确定要删除这个项目吗？',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    }
  );
  
  // 处理彻底删除
  await todoController.deleteById(currentTodo.value.id);
  const newTodos = await todoController.getList();
  await updateTodoList(newTodos);
  updateTodoSettingPopupHandle(false);
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
  
  .content {
    padding: 10px;
    border-radius: 10px;
    background-color: #ddd;
    
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
}
</style>