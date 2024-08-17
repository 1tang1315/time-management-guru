import { todoStore } from '@/store/index.js';
import { storeToRefs } from 'pinia'
import { addTodo, getTodo, getAllTodos, updateTodo, removeTodoByText } from '@/db/todos.js';
import { updateActivity } from '@/db/activities.js';

export const todoData = () => {
  const store = todoStore();
  const { addTodoActivityPopup, timingPopup, todoSettingPopup, moveToCollectionPopup, currentTodo } = storeToRefs(store);

  const ChangeCurrentTodoHandle = (obj) => {
    store.ChangeCurrentTodo(obj);
  }

  const getTodoHandle = async (key) => {
    return await getTodo(key);
  }
  const getAllTododsHandle = async () => {
    const data = await getAllTodos();
    const filteredData = data.filter(item => !item.hasOwnProperty('collection') || item.collection == '');
    const todos = filteredData.sort((a, b) => a.completed - b.completed);
    
    return todos;
  }
  const updateTodoHandle = async (obj) => { 
    try {
      await updateTodo(obj);
    } catch (e) {
      alert(e);
    }
  }
  const addTodoHandle = async (obj) => { 
    try {
      await addTodo(obj);
    } catch (e) {
      alert(e.message);
    }
  }
  const removeTodoByTextHandle = async (text) => { 
    try {
      await removeTodoByText(text);
    } catch (e) { 
      alert(e.message);
    }
  }

  const updateTodoActivityHandle = async (obj) => { 
    try {
      await updateActivity(obj);
    } catch (e) { 
      alert(e.message);
    }
  }

  const updateTodoActivityPopupHandle = (value) => {
    store.ChangeAddTodoActivityPopup(value);
  }

  const updateTimingPopupHandle = (value) => {
    store.ChangeTimingPopup(value);
  }
  const updateTodoSettingPopupHandle = (value) => {
    store.ChangeTodoSettingPopup(value);
  }
  const ChangeMoveToCollectionPopupHandle = (value) => {
    store.ChangeMoveToCollectionPopup(value);
  }

  return {
    currentTodo,
    timingPopup,
    todoSettingPopup,
    addTodoActivityPopup,
    moveToCollectionPopup,
    ChangeMoveToCollectionPopupHandle,
    ChangeCurrentTodoHandle,
    removeTodoByTextHandle,
    getAllTododsHandle,
    getTodoHandle,
    updateTodoHandle,
    addTodoHandle,
    updateTodoActivityHandle,
    updateTodoActivityPopupHandle,
    updateTodoSettingPopupHandle,
    updateTimingPopupHandle
  }
}
