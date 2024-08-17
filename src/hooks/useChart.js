import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LegendComponent, GridComponent, DataZoomComponent } from 'echarts/components';
import 'echarts/lib/chart/line';
import 'echarts/lib/chart/bar';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import { ref, onMounted, provide, toRaw, nextTick } from 'vue';

echarts.use([
  CanvasRenderer,
  GridComponent,
  LegendComponent,
  DataZoomComponent
]);

export function useChart() {
  // 线性图 柱状图
  function ChartInit(chartInstance, type, title, subtext, xAxisData, yAxisData, visibleCount) {
    const option = {
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
        top: '20%',
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
    };

    // 如果 visibleCount 存在且大于零，则添加 dataZoom 组件
    if (visibleCount && visibleCount > 0) {
      option.dataZoom = [
        {
          type: 'slider',
          xAxisIndex: [0]
        }
      ];
    }
    chartInstance.setOption(option);
  }

  const PieInit = (chartInstance, text, data) => {
    chartInstance.setOption({
      title: {
        text: text,
        subtext: '专注时长分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'horizontal',
        left: 'left',
        bottom: 'bottom',
        textStyle: {
          color: 'white',
        },
        formatter: function(name) {
          const option = chartInstance.getOption();
          let total = 0;
          let target;
          for (let i = 0, l = option.series[0].data.length; i < l; i++) {
            total += option.series[0].data[i].value;
            if (option.series[0].data[i].name === name) {
              target = option.series[0].data[i].value;
            }
          }
          return name + ' (' + ((target / total) * 100).toFixed(2) + '%)';
        }
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          center: ['50%', '50%'],  // 移动饼状图的位置 x, y
          data: data,
          label: {
            formatter: function(params) {
              // params数据项: value 和 name
              // 将value的分钟数值转成时分的表示
              const hours = Math.floor(params.value / 60);
              const minutes = params.value % 60;
              if (hours === 0) {
                return `${params.name}:${minutes}分`;
              } else {
                return `${params.name}:${hours}小时${minutes}分`;
              }
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    });
  }

  // 剔除0数据
  function filterZeroData(xDataArray, yDataArray) {
    const xData = [];
    const yData = [];

    for (let i = 0; i < xDataArray.length; i++) {
      if (yDataArray[i] > 0) {
        yData.push(yDataArray[i]);
        xData.push(xDataArray[i]);
      }
    }

    return { xData, yData };
  }

  return {
    echarts,
    PieInit,
    ChartInit,
    filterZeroData
  };
}
