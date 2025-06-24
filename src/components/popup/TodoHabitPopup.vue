<template>
  <div class="habit-todo-popup">
    <h4 class="title">{{ currentTodo.name }}</h4>
    
    <div class="current">
      <ul class="ul">
        <li class="item">
          <div class="left">时间</div>
          <div class="right">
            <el-time-picker
              size="small"
              v-model="currentTodo.remindTime"
              :default-value="new Date(0, 0, 0, 8, 0)"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="提醒时间"
            />
          </div>
        </li>
        <li class="item">
          <div class="left">重复</div>
          <div class="right">
            <el-select
              v-model="currentTodo.repetition"
              placeholder="重复周期"
              size="small"
            >
              <el-option
                v-for="item in ['每天', '每周', '每月', '每年', '隔天', '隔周', '隔月']"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </div>
        </li>
        <li class="item">
          <div class="left">停止重复</div>
          <div class="right">
            <el-date-picker
              size="small"
              v-model="currentTodo.stopRepetitionTime"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              type="date"
              placeholder="结束日期"
            />
          </div>
        </li>
      </ul>
    </div>
    
    <div class="button">
      <el-button
        size="default"
        type="danger"
        @click="updateTodoHabitPopupHandle(false)"
      >取消
      </el-button>
      <el-button
        size="default"
        type="primary"
        @click="handleConfig"
      >确认
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { toRaw } from 'vue';
import { ElMessage } from 'element-plus';
import { todoData } from "@/hooks/todoData.js";
import { TodoController } from "@/db/controller/TodoController.js";
import moment from "moment";

const {
  currentTodo,
  updateTodoHabitPopupHandle,
  updateTodoSettingPopupHandle
} = todoData();
const todoController = new TodoController();

const handleConfig = async () => {
  currentTodo.value.isHabit = true;
  currentTodo.value['beginHabitTime'] = moment().format('YYYY-MM-DD');
  await todoController.update(toRaw(currentTodo.value));
  updateTodoHabitPopupHandle(false);
  updateTodoSettingPopupHandle(false);
  ElMessage.success("操作成功");
}
</script>

<style lang="scss" scoped>
:deep(.el-date-editor.el-input) {
  width: 120px;
}

.habit-todo-popup {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 250px;
  padding: 10px;
  z-index: 200;
  border-radius: 5px;
  background-color: #007acc;
  
  .title {
    margin: 10px 0;
    text-align: center;
    font-size: 20px;
  }
  
  .current {
    padding: 10px;
    border-radius: 10px;
    background-color: #ffffff;
    
    .ul {
      padding: 0 15px;
      border-radius: 10px;
      background-color: #007acc;
      
      .item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        
        .right {
          width: 120px;
        }
        
        input {
          display: inline-block;
          width: 100px;
          border: none;
          outline: none;
          color: #fff;
          background-color: transparent;
        }
      }
    }
  }
  
  .button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 60%;
    margin: 20px auto;
  }
}
</style>