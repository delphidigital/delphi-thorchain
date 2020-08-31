<template>
  <div>
    <div
      ref="chart"
      :style="{ height: placeholderHeight + 'px' }"
    />
  </div>
</template>

<script>
import Highcharts from 'highcharts';

export default {
  props: {
    chartOptions: {
      type: Object,
      default: () => {},
    },
    placeholderHeight: {
      type: Number,
      default: () => 250,
    },
  },
  watch: {
    chartOptions(newData) {
      const timeSinceUpdate = this.updatedAt ? (new Date() - this.updatedAt) : 10000;
      // 2 second debounce for chart updates
      if (timeSinceUpdate > 2000) {
        // NOTE(Fede): It seems that on some conditions Highcharts fails to init some internal
        // stuff properly and fails if called at the wrong time. Just retrying the update
        // seems to work just fine. Not worth it to dig deeper into the issue for now.
        try {
          this.chart.update(newData);
        } catch (e) {
          this.chart.update(newData);
        }
      }
    },
  },
  mounted() {
    if (typeof window === 'object') {
      this.chart = Highcharts.chart(this.$refs.chart, this.chartOptions);
      this.updatedAt = new Date();
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
};
</script>
