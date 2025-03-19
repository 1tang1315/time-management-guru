<template>
  <Header/>
  <div class="guide">
    <div class="day-guide">
      <h3 class="title">日记</h3>
      <v-md-editor
        v-model="diary"
        mode="edit"
        left-toolbar="undo redo | save todoList template focusRecord toBottom"
        :toolbar="diaryToolbar"
        @save="saveDiaryHandle"
        height="500px"/>
    </div>
    
    <div class="stage-guide">
      <h3 class="title">阶段计划</h3>
      <v-md-editor
        v-model="stagePlan"
        mode="edit"
        left-toolbar="undo redo | save todoList toBottom"
        :toolbar="diaryToolbar"
        @save="saveStagePlanHandle"
        height="500px"/>
    </div>
  </div>
  
  <div ref="chartRef" style="width: 100%; height: 500px;"></div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import { ref, onMounted } from 'vue';
import { ActivityController } from "@/db/controller/ActivityController.js";
import { NoteController } from "@/db/controller/NoteController.js";
import { Note } from "@/db/model/Note.js";
import moment from "moment/moment.js";
import 'moment/locale/zh-cn';

moment.locale('zh-cn');

const noteController = new NoteController();
const activityController = new ActivityController();

const diary = ref('');
const focusMorning = [];
const focusAfternoon = [];
const focusEvening = [];

function focusListHandle(focusList) {
  let focusText = '';
  
  if(focusList.length > 0) {
    focusList.forEach((item, index) => {
      let hour;
      let minute;
      if(item.duration >= 60) {
        hour = Math.floor(item.duration / 60);
        minute = item.duration % 60;
      }
      
      focusText += '  (' + (index + 1) + ')'
        + item.todoName + ' '
        + item.beginTime.split(' ')[1]
        + '~' + item.endTime.split(' ')[1]
        + '(' + (item.duration >= 60 ? hour + '小时' + minute + '分钟' : item.duration + '分钟') + ')'
        + ': ' + item.experience + '\n';
    });
  }
  
  return focusText;
}

const diaryToolbar = ref({
  todoList: {
    title: '输入字母"x"表示完成',
    icon: 'v-md-icon-checkbox',
    action(editor) {
      editor.insert(function(selected) {
        // 获取编辑器的所有内容，并按行拆分
        const lines = editor.text.split('\n');
        // 获取最后一行的内容
        const lastLine = lines[lines.length - 1].trim();
        
        let prefix = '';
        if(lastLine) {
          prefix = '\n- [ ] ';
        } else {
          prefix = '- [ ] ';
        }
        
        const placeholder = '请输入文本';
        const content = selected || placeholder;
        
        return {
          text: `${prefix}${content}`,
          selected: content,
        };
      });
    },
  },
  template: {
    title: '每天模板',
    icon: 'v-md-icon-tip',
    action(editor) {
      editor.insert(function() {
        let content = '\n\n### '
          + (moment().format('YYYY-MM-DD dddd')) + '\n'
          + '#### 睡眠\n'
          + '- 晚上: \n'
          + '- 午睡: \n'
          + '\n'
          + '#### 早上\n'
          + '- 早餐: \n'
          + '- 锻炼: \n'
          + '- 学习:\n'
          + '\n\n'
          + '#### 下午\n'
          + '- 午餐:\n'
          + '- 锻炼:\n'
          + '- 学习:\n'
          + '\n\n'
          + '#### 晚上\n'
          + '- 晚餐:\n'
          + '- 锻炼:\n'
          + '- 学习:\n'
          + '\n\n'
          + '#### 总结\n';
        
        return {
          text: content
        };
      });
    },
  },
  toBottom: {
    title: '滚动到底部',
    icon: 'v-md-icon-tip',
    action(editor) {
      editor.insert(function() {
        return {
          text: ''
        };
      });
    },
  },
  focusRecord: {
    title: '专注记录',
    icon: 'v-md-icon-tip',
    menus: [
      {
        name: 'focusMorning',
        text: '早上',
        action(editor) {
          editor.insert(function() {
            // 获取编辑器的所有内容，并按行拆分
            const lines = editor.text.split('\n');
            // 获取最后一行的内容
            const lastLine = lines[lines.length - 1].trim();
            
            const focusText = focusListHandle(focusMorning);
            
            let content = '';
            if(lastLine) {
              content = '\n' + focusText;
            } else {
              content = focusText;
            }
            
            return {
              text: `${content}`,
              selected: content,
            };
          });
        }
      },
      {
        name: 'focusAfternoon',
        text: '下午',
        action(editor) {
          editor.insert(function() {
            // 获取编辑器的所有内容，并按行拆分
            const lines = editor.text.split('\n');
            // 获取最后一行的内容
            const lastLine = lines[lines.length - 1].trim();
            
            const focusText = focusListHandle(focusAfternoon);
            
            let content = '';
            if(lastLine) {
              content = '\n' + focusText;
            } else {
              content = focusText;
            }
            
            return {
              text: `${content}`,
              selected: content,
            };
          });
        }
      },
      {
        name: 'focusEvening',
        text: '晚上',
        action(editor) {
          editor.insert(function() {
            // 获取编辑器的所有内容，并按行拆分
            const lines = editor.text.split('\n');
            // 获取最后一行的内容
            const lastLine = lines[lines.length - 1].trim();
            
            const focusText = focusListHandle(focusEvening);
            
            let content = '';
            if(lastLine) {
              content = '\n' + focusText;
            } else {
              content = focusText;
            }
            
            return {
              text: `${content}`,
              selected: content,
            };
          });
        }
      }
    ]
  }
});

const currentDate = moment().format('YYYY-MM-DD');
onMounted(async () => {
  const dayDataList = await activityController.getActivityByDate(currentDate);
  
  dayDataList?.forEach((item) => {
    const endTime = item.endTime.split(' ')[1];
    const endHour = endTime.split(':')[0];
    
    if(endHour < '12') {
      // 早上
      focusMorning.push(item);
    } else if(endHour >= '12' && endHour < '18') {
      focusAfternoon.push(item);
    } else {
      focusEvening.push(item);
    }
  });
});

const saveDiaryHandle = async (text) => {
  
  const diaryMarkdown = await noteController.getNoteByTitle('日记');
  
  if(diaryMarkdown) {
    diaryMarkdown.content = text;
    await noteController.update(diaryMarkdown);
  } else {
    const diaryMarkdown = {
      title: '日记',
      content: text
    }
    await noteController.add(diaryMarkdown);
  }
  alert('保存成功!!!');
}
onMounted(async () => {
  const diaryObj = await noteController.getNoteByTitle('日记');
  if(diaryObj) {
    diary.value = diaryObj.content;
  }
});

const stagePlan = ref('');
onMounted(async () => {
  const stagePlanObj = await noteController.getNoteByTitle('阶段计划');
  if(stagePlanObj) {
    stagePlan.value = stagePlanObj.content;
  }
});
const saveStagePlanHandle = async (text) => {
  const stagePlanObj = await noteController.getNoteByTitle('阶段计划');
  if(stagePlanObj) {
    stagePlanObj.content = text;
    await noteController.update(stagePlanObj);
  } else {
    const stagePlanObj = new Note({
      title: '阶段计划',
      content: text
    });
    await noteController.add(stagePlanObj);
  }
  alert('保存成功!!!')
}


import * as echarts from "echarts";

const chartRef = ref(null);

onMounted(() => {
  const chart = echarts.init(chartRef.value);
  
  // 生成日历数据（假设 2024 年）
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-01-15");
  const dateList = [];
  while(startDate <= endDate) {
    dateList.push(startDate.toISOString().split("T")[0]); // 格式化 YYYY-MM-DD
    startDate.setDate(startDate.getDate() + 1);
  }
  
  // 习惯列表
  const habits = ["早起", "阅读", "锻炼", "单词", "新闻"];
  
  // 生成随机打卡数据
  const data = [];
  habits.forEach((habit, rowIdx) => {
    dateList.forEach((date) => {
      data.push([date, rowIdx, Math.random() > 0.2 ? "✅" : "❌"]); // ✅ 或 ❌
    });
  });
  
  chart.setOption({
    tooltip: { trigger: "item" },
    grid: { left: "10%", right: "10%", top: "10%", bottom: "10%" },
    xAxis: {
      type: "category",
      data: dateList, // 横轴显示日期
      position: "top",
      axisTick: {
        show: false, // 隐藏刻度
      },
      axisLabel: {
        fontSize: 16,
      }
    },
    yAxis: {
      type: "category",
      data: habits,
      axisTick: {
        show: false, // 隐藏刻度
      },
      axisLabel: {
        fontSize: 16,
      }
    },
    series: [
      {
        type: "scatter",
        data: data,
        symbolSize: 0, // 隐藏散点
        label: {
          show: true,
          formatter: (params) => params.value[2], // 显示 ✅ ❌
          color: "#333", // 文字颜色
          fontSize: 20,
        },
      },
    ],
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: [0]
      }
    ]
  });
});
</script>

<style lang="scss" scoped>
.completed {
  text-decoration: line-through;
}

.title {
  margin: 0;
  margin-bottom: 10px;
  text-align: center;
  
  a {
    color: #1bc9c9;
  }
}

.guide {
  width: 100%;
  padding: 0 10px;
  display: flex;
  flex-wrap: wrap;
  
  .day-guide {
    width: 48%;
    padding-right: 10px;
  }
  
  .stage-guide {
    width: 50%;
  }
}
</style>