<template>
  <div class="home">
    <Header />
    <div class="content">
      <div class="left">
        <h1 class="title">时间轴({{ currentDate }})</h1>
        <div class="time-axis" v-if="dayData.length != 0">
          <div class="box">
            <ul id="first-list">
              <li v-for="item in dayData" :key="item.date">
                <span></span>
                <div class="info">
                  <span>{{ item.text }}</span>
                  <span>{{ item.duration / 60 >= 1 ? Math.floor(item.duration / 60) + '小时' + item.duration % 60 + '分钟' :
                    item.duration + '分钟'
                  }}</span>
                </div>
                <div class="time">
                  <span>{{ item.date.split('至')[0].trim().split(' ')[1] }}</span>
                  <span>{{ item.date.split('至')[1].trim().split(' ')[1] }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="null">
          <h2>暂无数据</h2>
        </div>
      </div>
      <div class="center">
        <h1 class="title">{{ currentDateShow }}</h1>
        <div class="subtitle">
          <span>当{{ date }}专注次数: {{ count }}</span>
          <span>当{{ date }}专注时长: {{ total / 60 >= 1 ? Math.floor(total / 60) + '小时' + total % 60 + '分钟' : total + '分钟'
          }}</span>
        </div>
        <nav class="change" @click="handlePieChange($event)">
          <button class="btn-left" @click="handleBtnLeft">&lt</button>
          <ul>
            <li v-for="(item, index) in ['日', '周', '月']" :key="item" :data-index='index'
              :class="PieActiveIndex == index ? 'pie-active' : ''">
              {{ item }}
            </li>
          </ul>
          <button class="btn-right" @click="handleBtnRight">&gt</button>
        </nav>
        <div class="pie-chart" ref="pieChartRef">
        </div>
      </div>
      <div class="right">
        <Todo :page="page" />
      </div>
    </div>

    <div class="chart">
      <div class="year" ref="YearLineChartRef"></div>
      <div class="month" ref="MonthLineChartRef"></div>
      <div class="season" ref="SeasonLineChartRef"></div>
    </div>
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Todo from '../../components/Todo.vue';
import { onMounted, ref, onUpdated, watch } from 'vue';
import { useChart } from '@/hooks/useChart';
const { echarts, PieInit, ChartInit, filterZeroData } = useChart();

import { getActivitiesByDate } from '@/db/activities.js';

import moment from 'moment';

const page = 'home';

const currentDate = ref(moment().format('YYYY-MM-DD'));
const currentDateShow = ref(moment().format('YYYY年MM月DD日'));

const PieActiveIndex = ref(0);

const pieChartRef = ref(null);
const pieChart = ref(null);

const YearLineChartRef = ref(null);
const YearLineChart = ref(null);
const MonthLineChartRef = ref(null);
const MonthLineChart = ref(null);
const SeasonLineChartRef = ref(null);
const SeasonLineChart = ref(null);

const date = ref('日'); // 日 月 周

const dayData = ref([]);
const total = ref(0); // 专注总时长
const count = ref(0); // 专注总次数

// 数据统计(中间饼状图)
function statistics(dataArray) {
  total.value = 0;
  count.value = 0;
  const pieData = [];
  dataArray.forEach(item => {
    count.value++;
    total.value += Number(item.duration);

    // 查找 pieData 中是否已经存在具有相同 name 的项
    let existingItem = pieData.find(pieItem => pieItem.name == item.text);

    if (existingItem) {
      // 如果存在，则将 duration 添加到现有的项上
      existingItem.value += Number(item.duration);
    } else {
      // 如果不存在，则创建一个新的项
      pieData.push({
        value: Number(item.duration),
        name: item.text
      });
    }
  })
  return pieData;
}

// 数据统计(底部折线图  每月总时长统计)
async function Monthstatistics(month) {
  let total = 0;
  const monthData = await getActivitiesByDate(month);
  monthData.forEach(item => {
    total += Number(item.duration);
  })
  return total;
}

// 根据日期计算是每月的第几周 以及该周日期(开始, 结束) date=2024-07-22 ->返回 { weekOfMonth=4,startDate: 2024-07-21, endDate: 2024-07-27}
function getWeekDetails(date) {
  // 计算当前日期所在的周数的开始结束日期，从星期日开始计算
  const mDate = moment(date, 'YYYY-MM-DD');
  // 计算本周的开始日期（星期日）
  const startDate = mDate.clone().startOf('week'); // 默认从星期日开始

  // 计算本周的结束日期（星期六）
  const endDate = mDate.clone().endOf('week');

  // 格式化日期为 YYYY-MM-DD 格式
  const format = 'YYYY-MM-DD';
  const startDateFormatted = startDate.format(format);
  const endDateFormatted = endDate.format(format);

  // 计算本月的第几周
  const startOfMonth = mDate.clone().startOf('month');
  const weekOfMonth = mDate.diff(startOfMonth, 'weeks') + 1;

  return {
    weekOfMonth,
    startDate: startDateFormatted,
    endDate: endDateFormatted
  };
}

onMounted(async () => {
  dayData.value = await getActivitiesByDate(currentDate.value);

  const pieData = statistics(dayData.value);

  // 图表初始化
  pieChart.value = echarts.init(pieChartRef.value);
  YearLineChart.value = echarts.init(YearLineChartRef.value);
  MonthLineChart.value = echarts.init(MonthLineChartRef.value);
  SeasonLineChart.value = echarts.init(SeasonLineChartRef.value);

  const year = currentDate.value.toString().split('-')[0];
  const month = currentDate.value.toString().split('-')[1];
  upDateYearLineAndSessionsLine(year);

  upDateMonthLine(year, month);

  PieInit(pieChart.value, currentDateShow.value, pieData);
})

const handlePieChange = async (e) => {
  const target = e.target; // 获取被点击的元素
  if (target.tagName === 'LI') {
    PieActiveIndex.value = target.getAttribute('data-index');
    if (target.textContent == '日') {
      date.value = '日';
      const pieData = statistics(await getActivitiesByDate(currentDate.value));
      PieInit(pieChart.value, currentDateShow.value, pieData)
    } else if (target.textContent == '周') {
      date.value = '周';
      const weekDetails = getWeekDetails(currentDate.value);

      const text = `${currentDateShow.value.toString().slice(0, -3)} 第${weekDetails.weekOfMonth}周 ${weekDetails.startDate.split('-')[1] + '-' + weekDetails.startDate.split('-')[2]}~${weekDetails.endDate.split('-')[1] + '-' + weekDetails.endDate.split('-')[2]}`;
      let weekData = [];
      for (let i = 0; i < 7; i++) {
        const date = String(weekDetails.startDate.split('-')[0]) + '-' + String(weekDetails.startDate.split('-')[1]) + '-' + String(Number(weekDetails.startDate.split('-')[2]) + Number(i)).padStart(2, '0');

        weekData.push(await getActivitiesByDate(date));
      }
      weekData = statistics(weekData.flat(1));

      PieInit(pieChart.value, text, weekData)
    } else if (target.textContent == '月') {
      date.value = '月';
      const text = currentDateShow.value.toString().slice(0, -3);
      const data = await getActivitiesByDate(currentDate.value.toString().slice(0, -3));
      const monthData = statistics(data);

      PieInit(pieChart.value, text, monthData)
    }
  }
}

const handleBtnLeft = async () => {
  if (date.value == '日') {
    currentDate.value = moment(currentDate.value).subtract(1, 'days').format('YYYY-MM-DD');
    currentDateShow.value = moment(currentDate.value).format('YYYY年MM月DD日');
    const pieData = statistics(await getActivitiesByDate(currentDate.value));
    PieInit(pieChart.value, currentDateShow.value, pieData)
  } else if (date.value == '周') {
    currentDate.value = moment(currentDate.value).subtract(1, 'week').format('YYYY-MM-DD');
    currentDateShow.value = moment(currentDate.value).format('YYYY年MM月DD日');
    const weekDetails = getWeekDetails(currentDate.value);

    const text = `${currentDateShow.value.toString().slice(0, -3)} 第${weekDetails.weekOfMonth}周 ${weekDetails.startDate.split('-')[1] + '-' + weekDetails.startDate.split('-')[2]}~${weekDetails.endDate.split('-')[1] + '-' + weekDetails.endDate.split('-')[2]}`;
    let weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = String(weekDetails.startDate.split('-')[0]) + '-' + String(weekDetails.startDate.split('-')[1]) + '-' + String(Number(weekDetails.startDate.split('-')[2]) + Number(i)).padStart(2, '0');

      weekData.push(await getActivitiesByDate(date));
    }
    weekData = statistics(weekData.flat(1));

    PieInit(pieChart.value, text, weekData)
  } else if (date.value == '月') {
    currentDate.value = moment(currentDate.value).subtract(1, 'month').format('YYYY-MM-DD');
    currentDateShow.value = moment(currentDate.value).format('YYYY年MM月DD日');
    const text = currentDateShow.value.toString().slice(0, -3);
    const data = await getActivitiesByDate(currentDate.value.toString().slice(0, -3));
    const monthData = statistics(data);

    PieInit(pieChart.value, text, monthData)
  }
}
const handleBtnRight = async () => {
  if (date.value == '日') {
    currentDate.value = moment(currentDate.value).add(1, 'days').format('YYYY-MM-DD');
    currentDateShow.value = moment(currentDate.value).format('YYYY年MM月DD日');
    const pieData = statistics(await getActivitiesByDate(currentDate.value));
    PieInit(pieChart.value, currentDateShow.value, pieData)
  } else if (date.value == '周') {
    currentDate.value = moment(currentDate.value).add(1, 'week').format('YYYY-MM-DD');
    currentDateShow.value = moment(currentDate.value).format('YYYY年MM月DD日');
    const weekDetails = getWeekDetails(currentDate.value);

    const text = `${currentDateShow.value.toString().slice(0, -3)} 第${weekDetails.weekOfMonth}周 ${weekDetails.startDate.split('-')[1] + '-' + weekDetails.startDate.split('-')[2]}~${weekDetails.endDate.split('-')[1] + '-' + weekDetails.endDate.split('-')[2]}`;
    let weekData = [];
    for (let i = 0; i < 7; i++) {
      const date = String(weekDetails.startDate.split('-')[0]) + '-' + String(weekDetails.startDate.split('-')[1]) + '-' + String(Number(weekDetails.startDate.split('-')[2]) + Number(i)).padStart(2, '0');

      weekData.push(await getActivitiesByDate(date));
    }
    weekData = statistics(weekData.flat(1));

    PieInit(pieChart.value, text, weekData)
  } else if (date.value == '月') {
    currentDate.value = moment(currentDate.value).add(1, 'month').format('YYYY-MM-DD');
    currentDateShow.value = moment(currentDate.value).format('YYYY年MM月DD日');
    const text = currentDateShow.value.toString().slice(0, -3);
    const data = await getActivitiesByDate(currentDate.value.toString().slice(0, -3));
    const monthData = statistics(data);

    PieInit(pieChart.value,text, monthData)
  }
}

const upDateYearLineAndSessionsLine = async (year) => {
  const lineYearData = [];
  const lineYearName = []; // 如: 2024-01
  const lineSessionData = [0, 0, 0, 0];

  // 年和季节
  for (let month = 1; month < 13; month++) {
    const date = year + '-' + month.toString().padStart(2, '0');
    lineYearName.push(date);
    lineYearData.push(await Monthstatistics(date))
    if (month == 3 || month == 4 || month == 5) {
      lineSessionData[0] += Number(await Monthstatistics(date));
    } else if (month == 6 || month == 7 || month == 8) {
      lineSessionData[1] += Number(await Monthstatistics(date));
    } else if (month == 9 || month == 10 || month == 11) {
      lineSessionData[2] += Number(await Monthstatistics(date));
    } else if (month == 12 || month == 1 || month == 2) {
      lineSessionData[3] += Number(await Monthstatistics(date));
    }
  }


  const { xData: yearXData, yData: yearYData } = filterZeroData(lineYearName, lineYearData);
  ChartInit(YearLineChart.value, 'line', `${year}年`, '年度专注时长分布', yearXData, yearYData);

  const { xData: seasonXData, yData: seasonYData } = filterZeroData(['春(3,4,5)', '夏(6,7,8)', '秋(9,10,11)', '冬(12,1,2)'], lineSessionData);
  ChartInit(SeasonLineChart.value, 'line', '季度', '季度专注时长分布', seasonXData, seasonYData);
}
watch(() => currentDate.value.toString().split('-')[0], (newYearValue) => {
  upDateYearLineAndSessionsLine(newYearValue);
}, {
  immediate: false,
})

const upDateMonthLine = async (year, month) => {
  const lineMonthData = [];
  const lineMonthName = []; // 如: 01

  for (let day = 1; day < 32; day++) {
    const date = year + '-' + month + '-' + day.toString().padStart(2, '0');
    lineMonthName.push(day + '日');
    lineMonthData.push(await Monthstatistics(date))
  }

  const { xData: monthXData, yData: monthYData } = filterZeroData(lineMonthName, lineMonthData);  
  ChartInit(MonthLineChart.value, 'line', `${month}月`, '月度专注时长分布', monthXData, monthYData);
}
watch(() => currentDate.value.toString().split('-')[1], (newMonthValue) => {
  const year = currentDate.value.toString().split('-')[0];
  upDateMonthLine(year, newMonthValue);
}, {
  immediate: false,
})

onUpdated(async () => {
  dayData.value = await getActivitiesByDate(currentDate.value);
})
</script>

<style lang="scss" scoped>
.null {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-active {
  background-color: #666;
}

.content {
  display: flex;
  justify-content: space-around;

  .title {
    text-align: center;
    font-size: 20px;
  }

  .center {
    width: 33%;
    height: 450px;
    background-color: var(--background-color);

    .subtitle {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      span {
        padding: 2px 5px;
      }
    }

    .change {
      position: relative;
      margin-bottom: 10px;

      ul {
        justify-content: center;
        display: flex;
      }

      .btn-left,
      .btn-right {
        position: absolute;
        text-align: center;
        width: 22px;
        height: 20px;
        cursor: pointer;
        z-index: 100;
      }

      .btn-left {
        left: 85px;
        top: 36px;
      }

      .btn-right {
        right: 85px;
        top: 36px;
      }

      li {
        width: 40px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        padding: 2px 5px;
        border-top: 1px solid skyblue;
        border-bottom: 1px solid skyblue;
        cursor: pointer;

        &:hover {
          background-color: #666;
        }
      }

      li:first-child {
        border-left: 2px solid skyblue;
        border-radius: 15px 0 0 15px;
      }

      li:last-child {
        border-right: 2px solid skyblue;
        border-radius: 0 15px 15px 0;
      }

    }

    .pie-chart {
      width: 100%;
      height: 350px;
    }
  }

  .left {
    width: 33%;
    height: 450px;
  }

  .right {
    width: 33%;
    height: 450px;
  }
}

.time-axis {
  .box {
    margin-top: 10px;
    height: 363px;
    overflow: auto;
    padding: 10px 0 40px 60px
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


  .box ul li>span {
    content: "";
    display: block;
    width: 0;
    height: 100%;
    border: 1px solid #fff;
    position: absolute;
    top: 0;
    left: -30px
  }

  .box ul li>span:before,
  .box ul li>span:after {
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

  .box ul li>span:before {
    top: -10px
  }

  .box ul li>span:after {
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

  .year,
  .month,
  .season {
    width: 600px;
    height: 100%;
  }
}
</style>