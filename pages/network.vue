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
        <div class="section">
          <div class="section__header">
            <h2 class="section__title">
              Node Status
            </h2>
          </div>
          <div class="section__body">
            Some content over here
          </div>
        </div>
      </div>

      <div class="pure-u-1 pure-u-md-1-3">
        <div class="section">
          <div class="section__header">
            <h2 class="section__title">
              Latest Blocks
            </h2>
          </div>
          <div class="section__body">
            Some content over here
          </div>
        </div>
        <div class="section">
          <div class="section__header">
            <h2 class="section__title">
              Bond
            </h2>
          </div>
          <div class="section__body">
            Some content over here
          </div>
        </div>
      </div>

      <div class="pure-u-1 pure-u-md-1-3 section--split-right">
        <div class="section">
          <div class="section__header">
            <h2 class="section__title">
              System Security
            </h2>
          </div>
          <div class="section__body">
            Some content over here
          </div>
        </div>
        <div class="section">
          <div class="section__header">
            <h2 class="section__title">
              System Solvency
            </h2>
          </div>
          <div class="section__body">
            Some content over here
          </div>
        </div>
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
