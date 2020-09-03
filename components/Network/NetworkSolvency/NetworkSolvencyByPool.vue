<template>
  <div class="by-pool">
    <div class="by-pool-header">
      <h3>By Pool</h3>
      <div class="by-pool-info">
        <span class="by-pool-info__icon">
          ?
        </span>
        <div class="by-pool-key">
          <p>
            <span class="app__marker--long marker--green" />stored - actual assets in vault address
          </p>
          <p>
            <span
              class="app__marker--long marker--red"
            />recorded - assets expected to be stored in vault
          </p>
        </div>
      </div>
    </div>
    <NetworkSolvencyByPoolChart />
  </div>
</template>

<style lang="scss" scoped>
.by-pool {
  padding: 15px 0px 20px 0px;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.by-pool-key {
  font-size: 10px;
  position: absolute;
  top: 0px;
  left: -280px;
  background-color: $color-bg-popup;
  width: 275px;
  padding: 15px 5px 10px 10px;
  border-radius: 5px;
  display: none;
  z-index: 5;

  p {
    margin-bottom: 5px;
  }
}

.by-pool-info {
  border: 1px solid $color-text-secondary;
  height: 15px;
  width: 15px;
  border-radius: 50%;
  margin-right: 15px;
  cursor: pointer;
  position: relative;

  &:hover {
    .by-pool-key {
      display: block;
    }
  }
}

.by-pool-info__icon {
  color: $color-text-secondary;
  font-size: 10px;
  line-height: 14px;
  text-align: center;
  display: block;
  width: 100%;
}

.by-pool-header {
  display: flex;
  justify-content: space-between;
}


h3 {
  font-size: 14px;
  font-weight: 400;
  color: $color-text-secondary;
  margin-bottom: 15px;
  margin-left: 25px;
}

.marker--red {
  background-color: $color-red;
}

.marker--green {
  background-color: $color-green;
}
</style>
