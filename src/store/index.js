import { defineStore } from 'pinia'

// storeId 浏览器插件 与之关联 必填
export const initStore = defineStore('initStoreId', {
  state: () => ({
    NavActiveIndex: sessionStorage.getItem('NavActiveIndex') ? parseInt(sessionStorage.getItem('NavActiveIndex')) : 0,
    isDarkTheme: localStorage.getItem('isDarkTheme') !== null
      ? localStorage.getItem('isDarkTheme') === 'true'
      : true,
  }),
  getters: { // getters 类似计算属性 返回新的属性
    // doubleCount: (state) => state.count * 2,
  },
  actions: { // actions 直接修改数据
    ChangeNavActiveIndex(value) {
      this.NavActiveIndex = value;
      sessionStorage.setItem('NavActiveIndex', value);
    },
    ChangeIsDarkTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      localStorage.setItem('isDarkTheme', this.isDarkTheme);
    }
  }
})

export const collectionStore = defineStore('collectionStoreId', {
  state: () => ({
    addCollectionTodoPopup: false,
    currentCollection: {}
  }),
  actions: { // actions 直接修改数据
    ChangeAddCollectionTodoPopup(value) {
      this.addCollectionTodoPopup = value;
    },
    ChangeCurrentCollection(obj) {
      this.currentCollection = obj;
    },
  }
})

export const todoStore = defineStore('todoStoreId', {
  state: () => ({
    addTodoActivityPopup: false,
    todoSettingPopup: false,
    moveToCollectionPopup: false,
    currentTodo: {},
    timingPopup: false,
    isRunning: false,
    worker: null,
    minutes: '',
    seconds: ''
  }),
  actions: { // actions 直接修改数据
    ChangeAddTodoActivityPopup(value) {
      this.addTodoActivityPopup = value;
    },
    ChangeTimingPopup(value) { 
      this.timingPopup = value;
    },
    ChangeTodoSettingPopup(value) {
      this.todoSettingPopup = value;
    },
    ChangeMoveToCollectionPopup(value) {
      this.moveToCollectionPopup = value;
    },
    ChangeCurrentTodo(obj) {
      this.currentTodo = obj;
    },
    ChangeIsRunning(value) { 
      this.isRunning = value;
    },
    initWorker() {
      this.worker = new Worker(new URL('@/workers/timerWorker.js', import.meta.url));
      this.worker.onmessage = (e) => {
        this.seconds = e.data.seconds;
        this.minutes = e.data.minutes;
      };
    },
    terminateWorker() {
      this.worker = null;
    }
  }
})