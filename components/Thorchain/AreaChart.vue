<template>
  <div class="coming-soon__parent">
    <ComingSoon />
    <div class="coming-soon__target">
      <AppHighchart
        :chart-options="chartOptions"
        :placeholder-height="130"
      />
    </div>
  </div>
</template>

<script>
import { format } from 'date-fns';

export default {
  props: {
    // NOTE(Fede): data prop should be a list of objects {date: Date, value: number}
    data: {
      type: Array,
      default: () => [],
    },
    max: {
      type: Number,
      default: null,
    },
    formatLabel: {
      type: Function,
      default: v => v,
    },
  },
  computed: {
    chartOptions() {
      const formatLabel = this.formatLabel;
      const areaColor = '#323f64';
      return {
        chart: {
          type: 'areaspline',
          backgroundColor: 'transparent',
          height: 130,
          margin: [5, 0, 25, 32],
        },
        title: false,
        labels: false,
        credits: false,
        legend: false,
        plotOptions: {
          areaspline: {
            dataLabels: {
              enabled: false,
            },
            fillColor: areaColor,
          },
        },
        tooltip: {
          formatter() {
            return `
              <div class="app-tooltip">
                <div class="app-tooltip__header">
                  <span>${this.point.category}</span>
                </div>
                <div class="app-tooltip__body">
                  <p class="app-tooltip__text">
                    ${formatLabel(this.point.y)}
                  </p>
                </div>
              </div>
            `;
          },
          useHTML: true,
          borderWidth: 0,
          borderRadius: 0,
          borderColor: 'transparent',
          backgroundColor: 'transparent',
          shadow: false,
          padding: 0,
        },
        xAxis: {
          categories: this.data.map(e => format(e.date, 'dd MMM yyyy')),
          labels: {
            formatter() {
              const baseStyle =
                'font-size: 10px; font-weight: 500; font-family: Montserrat; position: relative;';
              if (this.isLast) {
                return `
                  <p 
                    style="${baseStyle} left: -31px;">
                    ${this.value}
                  </p>`;
              }
              if (this.isFirst) {
                return `
                  <p 
                    style="${baseStyle} left: 30px;">
                    ${this.value}
                  </p>`;
              }
              return null;
            },
            useHTML: true,
            style: { color: '#fff', fontSize: 10 },
            title: false,
            overflow: 'allow',
            margin: 0,
            padding: 0,
          },
          lineColor: areaColor,
          plotLines: [
            {
              color: areaColor,
              width: 1,
              value: this.data.length - 1,
            },
          ],
          tickPositions: [0, this.data.length - 1],
          min: 0.5,
          max: this.data.length - 1.5,
          minPadding: 0,
          maxPadding: 0,
        },
        yAxis: {
          title: false,
          max: this.max,
          tickAmount: 5,
          labels: {
            formatter() {
              if (this.isLast || this.isFirst) {
                return formatLabel(this.value);
              }
              return null;
            },
            style: { color: '#fff', fontSize: 10 },
            x: -5,
          },
          gridLineColor: areaColor,
          lineColor: areaColor,
          lineWidth: 1,
          minPadding: 0,
          maxPadding: 0,
        },
        series: [{
          marker: {
            enabled: false,
          },
          color: areaColor,
          data: this.data.map(e => e.value),
        }],
      };
    },
  },
};
</script>
