<template>
  <div class="chart" ref="chartRef">

  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

// chart start
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LegendComponent, GridComponent } from 'echarts/components';

import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';

echarts.use([
  CanvasRenderer,
  GridComponent,
  LegendComponent
]);

const chartRef = ref(null);
const chart = ref(null);


onMounted(() => {
  chart.value = echarts.init(chartRef.value);
  ChartInit(chart.value, type, title, subtext, xAxisData, yAxisData);
})


function ChartInit(chartInstance, type, title, subtext, xAxisData, yAxisData) {
  chartInstance.setOption({
    title: {
      text: title,
      subtext: subtext,
      left: 'center',
      textStyle: {
        color: '#fff',
        fontSize: 20
      },
      subtextStyle: {
        color: '#fff',
        fontSize: 16
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter(value) {
          return value + ' 分钟';
        }
      }
    },
    series: [
      {
        data: yAxisData,
        type: type,
        smooth: true,
        label: {
          show: true,
          position: 'top',
          fontSize: 16,
          formatter(params) {
            const hours = Math.floor(params.value / 60);
            const minutes = params.value % 60;
            return hours === 0 ? `${minutes}分` : `${hours}小时${minutes}分`;
          }
        }
      }
    ],
    tooltip: {
      trigger: 'item'
    }
  });
}
</script>

<style lang="scss" scoped>
 .chart {
    width: 600px;
    height: 100%;
  }
</style>