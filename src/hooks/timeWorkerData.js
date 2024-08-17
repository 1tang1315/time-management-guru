import { ref } from 'vue';
import { todoStore } from '@/store/index.js';
import { storeToRefs } from 'pinia';

export function timerWorkerData() {
  const store = todoStore();

  const { isRunning, worker, minutes, seconds } = storeToRefs(store);

  const ChangeIsRunningHandle = (value) => {
    store.ChangeIsRunning(value);
  }

  const initWorkerHandle = () => {
    store.initWorker();
  };

  const startTimer = () => {
    if (worker.value) {
      worker.value.postMessage('start');
    }
  };

  const stopTimer = () => {
    if (worker.value) {
      worker.value.postMessage('stop');
    }
  };

  const continueTimer = () => {
    if(worker.value) {
      worker.value.postMessage('continue');
    }
  }

  const resetTimer = () => {
    if (worker.value) {
      worker.value.postMessage('reset');
    }
  };

  const terminateWorkerHandle = () => {
    if (worker.value) {
      worker.value.postMessage('terminate');
      worker.value.terminate();
      store.terminateWorker();
    }
  };

  return {
    seconds,
    minutes,
    isRunning,
    ChangeIsRunningHandle,
    initWorkerHandle,
    terminateWorkerHandle,
    startTimer,
    stopTimer,
    continueTimer,
    resetTimer,
  };
}
