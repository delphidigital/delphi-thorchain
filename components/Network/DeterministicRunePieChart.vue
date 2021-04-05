<template>
  <div class="runepiechart-wrapper">
    <AppHighchart :chart-options="chartOptions" :placeholder-height="150" />
    <div class="runepiechart-legendwrapper">
      <div class="runepiechart-legend">
        <div class="circle-bullet" style="border-color: #5529a9;"></div>
        <div class="runepiechart-legendtext">Speculative Multiplier</div>
        <div>{{specMultiplier}}</div>
      </div>
      <div class="runepiechart-legend">
        <div class="circle-bullet" style="border-color: #2d99fe;"></div>
        <div class="runepiechart-legendtext">Deterministic Price</div>
        <div>{{detRunePrice}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral';
import AppHighchart from '../Common/AppHighchart.vue';
export default {
  components: {
    AppHighchart,
  },
  props: {
    chartData: {
      type: Array,
      default: () => [],
    },
    deterministicRunePrice: {
      type: Number,
      default: () => 0,
    },
    speculativeMultiplier: {
      type: Number,
      default: () => 0,
    },
  },
  computed: {
    detRunePrice() {
      return numeral(this.deterministicRunePrice).format('($0,0.00)');
    },
    specMultiplier() {
      return `x${this.speculativeMultiplier.toFixed(2)}`;
    },
    chartOptions() {
      return {
        chart: {
          type: 'pie',
          backgroundColor: 'transparent',
          height: 150,
          width: 200,
          margin: [0, 0, 0, 0],
        },
        title: {
          text: ''
        },
        // title: {
        //   text: `
        //     <div style="text-align: center;">
        //         <div style="margin-bottom: 12px; font-family: Montserrat; font-size: 24px; font-weight: 500; line-height: 32px;font-weight: 700;">
        //             ${deterministicRunePrice}
        //         </div>
        //         <div style="font-size: 13px; opacity: 0.75;font-weight: 600;margin-bottom: 20px;">
        //             Deterministic Price
        //         </div>
        //         <hr style="opacity: 0.2"/>
        //         <div style="margin-bottom: 12px; font-family: Montserrat; font-size: 24px; font-weight: 500; line-height: 32px;font-weight: 700;margin-top: 20px;">
        //             x ${speculativeMultiplier}
        //         </div>
        //         <div style="font-size: 13px; opacity: 0.75;font-weight: 500;">
        //             Speculative Multiplier
        //         </div>
        //     </div>
        //     `,
        //   style: { color: '#fff' },
        //   useHTML: true,
        //   verticalAlign: 'middle',
        //   floating: true,
        // },
        // subtitle: {
        //   text: `
        //     <span style="font-family: Montserrat; font-size: 12px; font-weight: 300; opacity: 80%;">Total nodes</span>
        //     `,
        //   style: { color: '#fff' },
        //   useHtml: true,
        //   verticalAlign: 'middle',
        //   floating: true,
        //   y: 25,
        // },
        tooltip: {
          formatter() {
            return `
              <div class="app-tooltip">
                <div class="app-tooltip__header">
                  <span style="background-color: ${this.point.color}" class="app-tooltip__marker"></span><span>${this.point.name}</span>
                </div>
                <div class="app-tooltip__body">
                  <p class="app-tooltip__text">
                    ${numeral(this.point.label).format('($0,0.00)')}
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
        labels: false,
        credits: false,
        plotOptions: {
          pie: {
            dataLabels: {
              enabled: false,
            },
            borderColor: null,
          },
        },
        series: [{
          innerSize: '92%',
          data: this.chartData,
        }],
      };
    },
  },
};
</script>

<style lang="scss">
.runepiechart-wrapper {
  display: flex;
  flex-direction: row;
}
.chart-placeholder {
  height: 150px;
}
.runepiechart-legendwrapper {
  padding-right: 24px;
  display: flex;
  flex-direction: column;
  margin: 0;
  flex: 1;
  text-align: left;
  align-items: flex-start;
  justify-content: center;

      /* display: flex;
    flex-direction: column;
    align-items: baseline;
    margin-right: 10px;
    justify-content: center; */
}
.runepiechart-legend {
  width: 100%;
  display: flex;
  justify-content: left;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  @media screen and (max-width: $pureg-lg) {
    font-size: 12px;
  }
}
.runepiechart-legendtext {
  flex: 1;
}
.circle-bullet {
  margin-right: 10px;
  border: 2px solid #a1a1a1;
  padding: 3px; 
  width: 3px;
  height: 3px;
  border-radius: 100px;
}
</style>
