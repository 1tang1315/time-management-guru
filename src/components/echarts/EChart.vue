<template>
  <v-chart class="chart" :option="option" />
</template>

<script setup>
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { ref, provide, onMounted } from 'vue';

use([
  CanvasRenderer,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
]);

const option = ref({
  title: {
    text: '111',
    subtext: '222',
    left: 'center',
    textStyle: {
      color: '#fff',
      fontSize: 20,
    },
    subtextStyle: {
      color: '#fff',
      fontSize: 16,
    },
  },
  grid: {
    top: '20%',
    left: '15%',
    right: '10%',
    bottom: '15%',
  },
  xAxis: {
    type: 'category',
    data: [
      '2024-04-10',
      '2024-04-11',
      '2024-04-12',
      '2024-04-13',
      '2024-04-14',
      '2024-04-15',
    ],
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter(value) {
        return value + ' 分钟';
      },
    },
  },
  series: [
    {
      data: [61, 223, 243, 239, 76, 96],
      type: 'line',
      smooth: true,
      label: {
        show: true,
        position: 'top',
        fontSize: 16,
        formatter(params) {
          const hours = Math.floor(params.value / 60);
          const minutes = params.value % 60;
          return hours === 0 ? `${minutes}分` : `${hours}小时${minutes}分`;
        },
      },
    },
  ],
  tooltip: {
    trigger: 'item',
  },
  dataZoom: [
    {
      type: 'slider',
      start: 0,
      end: 50,
    },
  ],
});

provide(THEME_KEY, 'dark');
</script>

<style scoped lang="scss">
.chart {
  width: 600px;
  height: 100px;
}
</style>
