let isRunning = false;
let seconds = 0;
let minutes = 0;
let intervalId = null; // 保存定时器 ID

self.onmessage = function(e) {
  if (e.data === 'start') {
    isRunning = true;
  } else if (e.data === 'stop') {
    isRunning = false;
  } else if (e.data === 'reset') {
    isRunning = false;
    seconds = 0;
    minutes = 0;
    self.postMessage({ seconds, minutes });
  } else if (e.data === 'continue') {
    isRunning = true;
  } else if (e.data === 'terminate') {
    // 停止定时器并终止 Web Worker
    clearInterval(intervalId);
  }
};

function updateTimer() {
  if (isRunning) {
    seconds++;
    if (seconds == 60) {
      seconds = 0;
      minutes++;
    }
    self.postMessage({ seconds, minutes });
  }
}

intervalId = setInterval(updateTimer, 1000);
