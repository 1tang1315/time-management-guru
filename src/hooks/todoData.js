import { todoStore } from '@/store/index.js';
import { storeToRefs } from 'pinia'

export const todoData = () => {
  const store = todoStore();
  const {
    addTodoActivityPopup,
    timingPopup,
    todoSettingPopup,
    moveToCollectionPopup,
    todoHabitPopup,
    currentTodo
  } = storeToRefs(store);

  const ChangeCurrentTodoHandle = (obj) => {
    store.ChangeCurrentTodo(obj);
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
  const updateTodoHabitPopupHandle = (value) => {
    store.ChangeTodoHabitPopup(value);
  }

  return {
    currentTodo,
    timingPopup,
    todoSettingPopup,
    addTodoActivityPopup,
    moveToCollectionPopup,
    todoHabitPopup,
    ChangeMoveToCollectionPopupHandle,
    ChangeCurrentTodoHandle,
    updateTodoActivityPopupHandle,
    updateTodoSettingPopupHandle,
    updateTimingPopupHandle,
    updateTodoHabitPopupHandle
  }
}
