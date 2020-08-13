<template>
  <div class="page__container">
    <div class="page__header">
      <h1 class="page__title">
        Network
      </h1>
      <NetworkToggle />
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-md-1-3 section--split-left">
        <NodeStatus />
      </div>

      <div class="pure-u-1 pure-u-md-2-3 section--split-right network-top-right">
        <div class="pure-g">
          <div class="pure-u-1 pure-u-md-5-8 section--split-left">
            <NetworkSecurity />
          </div>
          <div class="pure-u-1 pure-u-md-3-8 section--split-right">
            <NetworkLatestBlocks />
          </div>
        </div>

        <NetworkSolvency />
      </div>
    </div>

    <div class="pure-g">
      <div class="pure-u-1 pure-u-md-1-2 section--split-left">
        <ChurnInfo />
      </div>
      <div class="pure-u-1 pure-u-md-1-2 section--split-right">
        <NodesByLocation />
      </div>
    </div>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.network-top-right {
  display: flex;
  flex-direction: column;
}
</style>
