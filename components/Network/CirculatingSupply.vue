<template>
  <div class="incentive-pendulum">
    <h3 class="section__subtitle">
      Circulating Supply
    </h3>
    <div class="incentive-pendulum-container">
      <div class="incentive-pendulum-bar-container">
        <svg viewBox="0 0 525 50">
          <line
            x1="10"
            y1="9"
            x2="515"
            y2="9"
            stroke="#2D3958"
            stroke-width="18"
            style="stroke-linecap: round;"
          />
          <line
            x1="10"
            y1="9"
            :x2="200"
            y2="9"
            stroke="#16ceb9"
            stroke-width="12"
            style="stroke-linecap: round;"
          />
        </svg>
      </div>
      <div class="incentive-tooltip-roi">
        <div>0</div>
        <div>500.000.000</div>
      </div>
    </div>
  </div>
</template>

<script>
</script>

<style lang="scss" scoped>


.incentive-pendulum {
  padding: 20px 25px;
}

.incentive-pendulum-container {
  width: 100%;
  margin: 0 auto;
  height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.incentive-pendulum-bar-container {
  position: relative;
}

.incentive-tooltip-roi {
  display: flex;
  flex-direction: row;
  margin-top: -14px;
  font-size: 13px;
  font-weight: 600;
  opacity: 0.7;

  > div {
    flex: 1;

    &:last-child {
      text-align: right;
    }
  }
}
</style>
