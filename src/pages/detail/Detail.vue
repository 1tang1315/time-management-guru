<template>
  <Header />
  <div class="top">
    <div class="left">
      <h4 class="title">今天计划或者待办项</h4>
      <TodoComponent @todoDetail="handletodoDetail" :page="page" />
    </div>
    <div class="right">
      <input class="chooseFile" type="file" ref="uploadRef" @change="handleFile" />
      <v-md-editor v-model="markdown" height="480px" @save="handleSave"></v-md-editor>
    </div>
  </div>
  <div class="bottom">
    <div class="chart">
      <div class="barChart" ref="barChartRef"></div>
      <div class="lineChart" ref="lineChartRef"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide, toRaw } from 'vue';
import Header from '@/components/Header.vue';
import TodoComponent from '@/components/Todo.vue';
import * as XLSX from 'xlsx';
import { saveToTodos, updateTodo, getTodo } from '@/db/todos.js';
import { saveToActivities, getAllActivities } from '@/db/activities.js';
import { updateMarkdown } from '@/db/markdowns.js';
import { diffChars } from 'diff';

// 计算两个字符串的差异
const mergeMarkdown = (original, generated) => {
  if (!original) {
    // 如果原始数据为空或undefined，直接返回生成的新数据
    return generated;
  }

  const diff = diffChars(original, generated);
  let merged = '';
  let originalIndex = 0;
  let generatedIndex = 0;

  diff.forEach(part => {
    if (part.added) {
      // 新生成的部分直接添加
      merged += part.value;
      generatedIndex += part.count;
    } else if (part.removed) {
      // 原始数据的被删除部分，不做处理
      merged += part.value;
      originalIndex += part.count;
    } else {
      // 没有变化的部分，保留原始数据中的内容
      merged += original.substring(originalIndex, originalIndex + part.count);
      originalIndex += part.count;
      generatedIndex += part.count;
    }
  });

  return merged;
};

// echart start
import { useChart } from '@/hooks/useChart.js';
const { echarts, ChartInit, filterZeroData } = useChart();

const barChartRef = ref(null);
const barChart = ref(null);
const lineChartRef = ref(null);
const lineChart = ref(null);

const intervalTime = [
  '00~01点', '01~02点', '02~03点', '03~04点', '04~05点',
  '05~06点', '06~07点', '07~08点', '08~09点', '09~10点',
  '10~11点', '11~12点', '12~13点', '13~14点', '14~15点',
  '15~16点', '16~17点', '17~18点', '18~19点', '19~20点',
  '20~21点', '21~22点', '22~23点', '23~00点'
];

onMounted(() => {
  barChart.value = echarts.init(barChartRef.value);
  lineChart.value = echarts.init(lineChartRef.value);
})
// echart end


const page = 'guide';
const markdown = ref('');

onMounted(async () => {
  const data = await getAllActivities();
  markdown.value = await convertToMarkdown(data);
})

function StatisticsDataOfHour(data) {
  let intervalDuration = new Array(24).fill(0);
  data.forEach(item => {
    const [start, end] = item.date.split(' 至 ');

    const startHour = parseInt(start.split(' ')[1].split(':')[0], 10);
    const endHour = parseInt(end.split(' ')[1].split(':')[0], 10);
    const startMinute = parseInt(start.split(' ')[1].split(':')[1], 10);
    const endMinute = parseInt(end.split(' ')[1].split(':')[1], 10);


    for (let hour = startHour; ; hour++) {
      if (hour == 24) {
        hour = 0
      }
      if (startHour == endHour) {
        intervalDuration[hour] += endMinute - startMinute;
        break;
      } else if (hour == startHour && startHour !== endHour) {
        intervalDuration[hour] += (60 - startMinute);
      } else if (hour == endHour) {
        intervalDuration[hour] += endMinute;
      } else {
        intervalDuration[hour]++;
      }

      if (hour == endHour) {
        break;
      }
    }
  });
  return intervalDuration;
}

function StatisticsDataOfEveryDay(data) {
  let xDayData = [];
  let yDayData = [];
  data.forEach((item) => {
    const [start, end] = item.date.split(' 至 ');
    const startDay = start.split(' ')[0];
    const endDay = end.split(' ')[0];
    const endHour = parseInt(end.split(' ')[1].split(':')[0], 10);
    const endHourMinute = parseInt(end.split(' ')[1].split(':')[1], 10);

    if (startDay == endDay) {
      let dateIndex = xDayData.indexOf(startDay);
      if (dateIndex !== -1) {
        // 日期存在
        yDayData[dateIndex] += Number(item.duration);
      } else {
        xDayData.push(startDay);
        yDayData.push(Number(item.duration));
      }
    } else {
      let endDayIndex = xDayData.indexOf(endDay);
      let startDayIndex = xDayData.indexOf(startDay);
      let beginHour = Number(0);
      let endDayMinuteTotal = Number(0);
      while (true) {
        if (beginHour == endHour) {
          endDayMinuteTotal += endHourMinute;
          break;
        } else {
          endDayMinuteTotal += 1;
        }
        beginHour++;
      }
      if (endDayIndex !== -1) {
        // 日期存在
        yDayData[endDayIndex] += endDayMinuteTotal;
      } else {
        xDayData.push(endDay);
        yDayData.push(endDayMinuteTotal);
      }

      if (startDayIndex !== -1) {
        // 日期存在
        yDayData[startDayIndex] += Number(item.duration) - endDayMinuteTotal;
      } else {
        xDayData.push(startDayIndex);
        yDayData.push(Number(item.duration) - endDayMinuteTotal);
      }
    }
  });
  return {
    xDayData,
    yDayData
  }
}

// 求最长专注连续天数
function calculateLongestStreak(dates) {
  if (dates.length === 0) return 0;

  // 将日期数组转换为 Date 对象数组
  const dateObjects = dates.map(date => new Date(date));

  // 对日期进行排序
  dateObjects.sort((a, b) => a - b);

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dateObjects.length; i++) {
    const diffInTime = dateObjects[i] - dateObjects[i - 1];
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    if (diffInDays === 1) {
      currentStreak += 1;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}


// 将全部数据转换为Markdown格式
async function convertToMarkdown(items) {
  const markdownOutput = [];
  const addedYears = {}; // 跟踪已经添加的年份
  const addedMonths = {}; // 跟踪已经添加的月份
  const addedDays = {}; // 跟踪已经添加的日

  let index = 0;
  items.forEach(item => {
    index++;
    const time = item.date.split(' ')[0]; // 提取开头时间
    const day = time.split('-')[2]; // 提取日部分
    const month = time.split('-')[1]; // 提取月部分
    const year = time.split('-')[0]; // 提取年部分

    const date = item.date
    const duration = item.duration;
    const experience = item.content.experience || ''; // 心得内容
    const status = item.content.status; // 状态内容
    const text = item.text;

    // 检查是否需要创建新的一级标题(年)
    if (!addedYears[year]) {
      markdownOutput.push({ year: year, content: `# ${year}\n` });
      addedYears[year] = true;
    }

    // 检查是否需要创建新的二级标题(月)
    const monthKey = `${year}-${month}`; // 使用年月作为唯一键
    if (!addedMonths[monthKey]) {
      markdownOutput.push({ month: month, content: `## ${month}月\n` });
      addedMonths[monthKey] = true;
    }

    // 检查是否需要创建新的三级标题(日)
    const dayKey = `${year}-${month}-${day}`; // 使用年月日作为唯一键
    if (!addedDays[dayKey]) {
      markdownOutput.push({ day: day, content: `### ${month}-${day}\n` });
      addedDays[dayKey] = true;
      index = 0;
    }

    // 添加条目到当前日期的内容
    markdownOutput[markdownOutput.length - 1].content += `${index + 1}.${date} (${duration}分钟) ${text}: 心得: ${experience}; 状态:${status}\n`;
  });

  // 构建最终的Markdown字符串
  return markdownOutput.map(item => `${item.content}`).join('\n');
}

const handletodoDetail = (todoDetail) => {
  const activities = toRaw(todoDetail.activities);
  let totalTime = 0;
  activities.forEach(item => {
    totalTime += Number(item.duration);
  });
  let hourTotal = Math.floor(totalTime / 60);
  let minute = totalTime % 60;

  const intervalDuration = StatisticsDataOfHour(activities);
  const { xData, yData } = filterZeroData(intervalTime, intervalDuration);
  ChartInit(barChart.value, 'bar', todoDetail.text, `总时长: ${hourTotal}小时${minute}分钟`, xData, yData);

  const { xDayData, yDayData } = StatisticsDataOfEveryDay(activities);
  const longestStreak = calculateLongestStreak(xDayData);
  ChartInit(toRaw(lineChart.value), 'line', todoDetail.text, `最长连续专注天数: ${longestStreak}`, xDayData, yDayData, true);


  // 将项目数据转化成Markdown
  let markdownOutput = `## ${todoDetail.text}\n`;
  let li = '';

  todoDetail.activities.forEach((item, index) => {
    markdownOutput += `${index + 1}.${item.date}(${item.duration}分钟): 心得: ${item.content.experience}; 状态: ${item.content.status}\n`;

    const hours = Math.floor(item.duration / 60); // 计算小时数
    const remainingMinutes = item.duration % 60; // 计算剩余的分钟数
    const time = hours > 0 ? `${hours}小时${remainingMinutes} 分钟` : `${remainingMinutes} 分钟`;

    li += `<li>
          <span class="dot"></span>
          <div class="info">
            <span>${item.content.experience || todoDetail.text}</span>
            <span>${time}</span>
          </div>
          <div class="time">
            <span>${item.date.split('至')[0].trim()}</span>
            <span>${item.date.split('至')[1].trim()}</span>
          </div>
        </li>`
  })

  // 添加时间轴组件的HTML代码
  markdownOutput += `
<style>
  .time-axis {
    padding: 10px;
    background-color: black;
  }
  .title {
    margin: 0;
    text-align: center;
    color: #fff;
  }
  .box {
    margin-top: 10px;
    height: 363px;
    overflow: auto;
    padding: 20px 0 40px 60px;
  }

  .box ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
    position: relative;
    transition: all 0.5s linear;
    top: 0
  }

  .box ul:before {
    content: "";
    display: block;
    width: 0;
    height: 100%;
    border: 1px dashed #fff;
    position: absolute;
    top: 0;
    left: 30px
  }

  .box ul li {
    margin: 0px 0px 35px 60px;
    position: relative;
    padding: 10px 20px;
    background: #203853;
    color: #fff;
    border-radius: 10px;
    line-height: 20px;
    width: 66%;
  }


  .box .dot {
    content: "";
    display: block;
    width: 0;
    height: 100%;
    border: 1px solid #fff;
    position: absolute;
    top: 0;
    left: -30px
  }

  .box .dot:before,
  .box .dot:after {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #48b5e1;
    border: 2px solid #fff;
    position: absolute;
    left: -7.5px
  }

  .box .dot:before {
    top: -10px
  }

  .box .dot:after {
    top: 95%
  }

  .box .info {
    display: flex;
    justify-content: space-between;
  }

  .box .time span {
    position: absolute;
    left: -100px;
    color: #fff;
    font-size: 80%;
    font-weight: bold;
  }

  .box .time span:first-child {
    top: -16px
  }

  .box .time span:last-child {
    top: 94%
  }
</style>
  <div class="time-axis">
    <h4 class="title">${todoDetail.text}</h4>
    <div class="box">
      <ul id="first-list">
       ${li}
      </ul>
    </div>
  </div>`;

  markdown.value = mergeMarkdown(todoDetail.markdown, markdownOutput);
}
provide('handletodoDetail', handletodoDetail);

const uploadRef = ref(null);

const handleFile = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
    const filteredData = json.slice(2); // 去掉开头两行

    const formattedData = filteredData.reduce((acc, row) => {
      const existingEntry = acc.find(entry => entry.text === row[1]);
      const newActivity = {
        date: row[0],
        duration: row[2],
        content: {
          experience: row[3],
          status: row[4],
          progress: row[5]
        }
      };

      if (existingEntry) {
        existingEntry.activities.push(newActivity);
      } else {
        acc.push({
          text: row[1],
          completed: false,
          activities: [newActivity]
        });
      }

      return acc;
    }, []);

    const formattedData2 = filteredData.map(row => ({
      date: row[0],
      text: row[1],
      duration: row[2],
      content: {
        experience: row[3],
        status: row[4],
        progress: row[5]
      }
    }));

    await saveToActivities(formattedData2);
    await saveToTodos(formattedData);
  };

  reader.readAsArrayBuffer(file);
}

const handleSave = async (text) => {
  const key = text.split('\n')[0].split(' ')[1];
  const todo = await getTodo(key);
  if (todo) {
    todo['markdown'] = text;
    updateTodo(todo);
  } else {
    // 拿到全部数据 全部数据或者年份之类的 不属于单个todo
    const data = {
      key: key,
      markdown: text
    }
    await updateMarkdown(data);
  }
}
</script>

<style lang="scss" scoped>
.title {
  margin: 5px 0;
  color: #ccc;
  text-align: center;
}

.top {
  width: 100%;
  height: 490px;
  display: flex;

  .right {
    width: 99%;
    height: 99%;
    margin-right: 10px;
    overflow: hidden;

    .chooseFile {
      margin-bottom: 10px;
    }
  }
}

.chart {
  margin-top: 20px;
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: space-between;

  .title {
    color: #fff;
  }

  .barChart,
  .lineChart {
    width: 600px;
    height: 100%;
  }
}
</style>