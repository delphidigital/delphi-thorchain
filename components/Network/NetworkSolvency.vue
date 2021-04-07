<template>
  <div class="section solvency">
    <div class="section__header" id="network-solvency">
      <h2 class="section__title">
        Solvency
      </h2>
      <a class="deeplink-selector" href="#network-solvency">
        <Icon name="link" scale="0.7"></Icon>
      </a>
      <a class="tweet__link" :href="tweetDeepLink" target="_blank">
        <Icon
          name="brands/twitter"
          scale="0.7"
        ></Icon>
      </a>
    </div>
    <div class="section__body" style="display: inline-flex;overflow: overlay;">
      <div class="solvency-body">
        <div class="overall-container">
          <NetworkSolvencyOverall />
        </div>
        <div class="by-pool-container">
          <NetworkSolvencyByPool />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    const baseUrl = process.env.APP_URL;
    const tabBasePath = this.$route.path;
    const networkSolvencyDeepLink = `${baseUrl}${tabBasePath}#network-solvency`;
    return {
      tweetDeepLink: `http://twitter.com/intent/tweet?text=${encodeURIComponent('Network Solvency')}&url=${encodeURIComponent(networkSolvencyDeepLink)}`,
    };
  },
}
</script>
<style lang="scss" scoped>
.solvency {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.solvency-body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  @media screen and (max-width: 600px) {
    flex-direction: column;
  }
}

.overall-container {
  border-bottom: 1px solid $color-border;
}

.by-pool-container {
  flex-grow: 1;
}
</style>
