<template>
  <div class="section">
    <div class="section__header standby-pools-header">
      <h2 class="section__title">Historical pool data</h2>
    </div>
    <div class="section__body">
      <div class="section__headinputs">

        <div class="section__capital_invested">
          <div class="section__headtitle">
            CAPITAL INVESTED
          </div>
          <div class="amountinput-wrapper">
            <Icon
              class="amountinput-icon"
              name="dollar-sign"
              scale="0.7"
              @click="focusAmountInvestedInput"
            >
            </Icon>
            <input
              v-model="amountInvested"
              placeholder="Amount invested"
              name="amount_invested"
              ref="amountInvestedRef"
              type="number"
              min="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div class="section__pool_select">
          <div class="section__headtitle">
            POOL
          </div>
          <div class="dropdown">
            <select name="two" class="dropdown-select">
              <option value="">Select Pool…</option>
              <option value="1">Option #1</option>
              <option value="2">Option #2</option>
              <option value="3">Option #3</option>
            </select>
          </div>
        </div>

        <div class="section__date_invested">
          <div class="section__headtitle">
            DATE INVESTED
          </div>
          <div>
            <date-picker v-model="time1" valueType="format" prefix-class="customdatepkr"></date-picker>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import numeral from "numeral";
import DatePicker from 'vue2-datepicker';

export default {
  components: { DatePicker },
  data: () => ({
    amountInvested: '100000.00',
    time1: null,
    time2: null,
    time3: null,
  }),
  methods: {
    focusAmountInvestedInput() {
      this.$refs.amountInvestedRef.focus();
    },
  },
};
</script>
<style lang="scss" scoped>
.runedata-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section__headinputs {
  display: flex;
  flex-direction: row;
  > div {
    flex-direction: column;
    flex-basis: 0;
    flex: 1 1 0px;
    padding: 16px 22px;

    .section__headtitle {
      font-size: 12px;
      line-height: 15px;
      font-weight: 600;
      color: $color-text-secondary;
      text-align: left;
      padding: 8px 0;
    }
  }
}
.amountinput-wrapper {
    position: relative;
    .amountinput-icon {
      font-size: 16px;
      color: rgba(137, 140, 177, 0.7);
      font-size: 0.7em;
      position: absolute;
      top: 14px;
      left: 14px;
      cursor: text;
    }
    input {
      padding: 4px 8px 4px 25px;
      border: 1px solid rgba(112, 115, 150, 0.65);
      border-radius: 16px;
      background-color: transparent;
      font-family: Montserrat, sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: rgb(190, 193, 226);
      caret-color: rgb(190, 193, 226);
      line-height: 20px;
      height: 38px;
      width: 100%;
    }
    input:focus {
      outline:none;
      border:1px solid rgba(120,124,170,0.95);
    }
}





.dropdown {
  display: inline-block;
  position: relative;
  overflow: hidden;
  height: 38px;
  width: 100%;
  background: transparent;
  border: 1px solid;
  background: transparent;
  border-color: rgba(112, 115, 150, 0.65);
  border-radius: 16px;
  -webkit-box-shadow: inset 0 1px rgba(255, 255, 255, 0.1), 0 1px 1px rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 1px rgba(255, 255, 255, 0.1), 0 1px 1px rgba(0, 0, 0, 0.2);
}

.dropdown:before, .dropdown:after {
  content: '';
  position: absolute;
  z-index: 2;
  top: 13px;
  right: 10px;
  width: 0;
  height: 0;
  border: 4px dashed;
  border-color: #888888 transparent;
  pointer-events: none;
}
.dropdown:before {
  border-bottom-style: solid;
  border-top: none;
  border-bottom-color: #aaa;
}
.dropdown:after {
  margin-top: 7px;
  border-top-style: solid;
  border-bottom: none;
  border-top-color: #aaa;
}
.dropdown-select {
  position: relative;
  width: 130%;
  margin: 0;
  padding: 6px 8px 6px 10px;
  height: 38px;
  line-height: 14px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0) !important; /* "transparent" doesn't work with Opera */
  border: 0;
  border-radius: 16px;
  -webkit-appearance: none;
  color: rgb(190, 193, 226);
  text-shadow: 0 1px black;
  background: #444;
}
.dropdown-select:focus {
  z-index: 3;
  width: 100%;
  outline: 2px solid rgba(120,124,170,0.95);
  outline-offset: -2px;
  color: #ccc;
}
.dropdown-select > option {
  margin: 3px;
  padding: 6px 8px;
  border-radius: 3px;
  cursor: pointer;
  background: #444;
  text-shadow: 0 1px rgba(0, 0, 0, 0.4);
}

/* Fix for IE 8 putting the arrows behind the select element. */
.lt-ie9 .dropdown { z-index: 1; }
.lt-ie9 .dropdown-select { z-index: -1; }
.lt-ie9 .dropdown-select:focus { z-index: 3; }
/* Dirty fix for Firefox adding padding where it shouldn't. */
@-moz-document url-prefix() { .dropdown-select { padding-left: 6px; } }

</style>
