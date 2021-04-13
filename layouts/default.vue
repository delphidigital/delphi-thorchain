<template>
  <div>
    <header class="header">
      <div class="header__content">
        <img src="/thorchain.svg" class="header__logo"></img>
        <div class="header__navigation">
          <nav
            class="header__nav"
            :class="{ 'header__nav--mobile-active': mobileMenuOpen }"
          >
            <nuxt-link
              class="header__link"
              exact-active-class="header__link--active"
              :to="{name: 'thorchain-blockchain', params: { blockchain: currentBlockchain }}"
            >
              Liquidity Pools
            </nuxt-link>
            <nuxt-link
              class="header__link"
              exact-active-class="header__link--active"
              :to="{name: 'thorchain-blockchain-network',
                    params: { blockchain: currentBlockchain }}"
            >
              Network
            </nuxt-link>
            <nuxt-link
              class="header__link"
              exact-active-class="header__link--active"
              :to="{name: 'thorchain-blockchain-nodes',
                    params: { blockchain: currentBlockchain }}"
            >
              Nodes
            </nuxt-link>
            
            <a class="header__link" :href="`https://defi.delphidigital.io/thorchain/${currentBlockchain}`">
              Single Chain
            </a>

            <a class="header__link" href="https://bitcoin-sage.medium.com/the-delphi-thorchain-dashboard-a1ad6fe2df0c" target="_blank">
              Documentation
            </a>
          </nav>
        </div>
        <a href="https://www.delphidigital.io/" target="_blank" class="header__logo header__logo--right">
          <img src="/powered_by_delphi.svg"></img>
        </a>
        <button class="menu-mobile-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
          <img src="/menu.svg"></img>
        </button>
      </div>
    </header>
    <main>
      <Nuxt />
    </main>
    <div
      class="menu-mobile-overlay"
      :class="{'menu-mobile-overlay--active': mobileMenuOpen}"
      @click="mobileMenuOpen = !mobileMenuOpen"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      mobileMenuOpen: false,
    };
  },
  computed: {
    currentPageName() {
      return this.$route.name;
    },
    currentBlockchain() {
      const param = this.$route.params.blockchain;
      if (param === 'testnet' || param === 'chaosnet') {
        return this.$route.params.blockchain;
      }
      return 'chaosnet';
    },
  },
};
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  background-color: $color-bg;
  padding: 0 12px;
  height: 65px;
  position: relative;
  z-index: 8;
}

.header__content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
}

.header__logo {
  max-height: 45px;
  max-width: 43%;
  margin: 0;
  display: flex;
  align-items: center;
  img {
    width: 100%;
  }
}

.header__logo--right {
  margin-left: auto;
  @media screen and (max-width: 750px) {
    margin-left: 10px;
  }
}

.header__navigation {
  display: flex;
  align-items: center;
}

.header__nav {
  display: flex;
  flex-direction: row;

  @media screen and (max-width: 750px) {
    display: none;
  }
}

.menu-mobile-toggle {
  background-color: transparent;
  height: 25px;
  width: 25px;
  outline: none;
  border: none;
  padding: 0;
  margin-left: auto;
  display: none;

  img {
    width: 100%;
  }

  @media screen and (max-width: 750px) {
    display: block;
  }
}

.menu-mobile-overlay {
  height: 100%;
  width: 100%;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 7;
  background-color: rgba(11, 14, 22, 0.8);
  display: none;
}

.menu-mobile-overlay--active {
  display: block;
}

.header__nav--mobile-active {
  position: absolute;
  width: 100%;
  top: 65px;
  left: 0px;
  background-color: $color-bg-popup;
  flex-direction: column;
  z-index: 10;
  display: flex;

  .header__link {
    margin-left: 10px;
    margin-top: 15px;
    margin-bottom: 15px;
    width: 150px;
  }
}

.header__link {
  font-size: 14px;
  font-weight: 400;
  opacity: 0.6;
  margin-left: 60px;
  color: #fff;
  text-decoration: none;
  line-height: 21px;

  &:hover, &:visited, &:focus {
    color: #fff;
    text-decoration: none;
  }
}

.header__link--active {
  opacity: 1;
  border-bottom: 2px solid $color-green;
}

</style>

<style lang="scss">
/*
* NOTE(Fede): Global styles go here
*/
// FONTS
//@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');


// PURE CSS overrides
// https://purecss.io/grids/#using-grids-with-your-font-family
html, button, input, select, textarea,
.pure-g [class *= "pure-u"] {
  /* Set your content font stack here: */
  font-family: Montserrat, sans-serif;
}

/* ELEMENT OVERRIDES */

html {
  font-family: Montserrat, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  color: #fff;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

body {
  background-color: $color-bg-shade;
}

h1 {
  margin: 0;
}

ul {
  display: block;
  list-style-type: none;
}

li {
  display: block;
  margin: 0;
  padding: 0;
}

button {
  outline: none;
  cursor: pointer;

  &:hover, &:focus {
    outline: none;
  }
}

a {
  text-decoration: none;

  &:hover, &:focus {
    text-decoration: none;
  }
}

/*
* CUSTOM ELEMENTS
*/
.app__marker--long {
  display: inline-block;
  width: 12px;
  height: 4px;
  border-radius: 3px;
  margin-right: 8px;
}

/*
* PAGE
*/

.page__container {
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 0 10px;
}
.section-disclamer {
  font-family: FreeSans,Arimo,"Droid Sans",Helvetica,Arial,sans-serif;
  font-size: 12px;
  padding: 16px 30px;
  margin: 16px auto 0 auto;
  background-color: #1e273c;
  font-weight: 600;
  max-width: 740px;
  text-align: center;
  line-height: 20px;
  color: #ffc4c4;
}

.page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media screen and (max-width: 21.5em) {
    flex-direction: column;
    justify-content: center;
    margin-bottom: 35px;
  }
}

.page__title {
  display: block;
  font-weight: 700;
  font-size: 22px;
  margin: 30px 0;
}

/*
 * SECTION
 */

.section {
  background-color: $color-bg;
  border-radius: 10px;
  margin-bottom: 30px;

  @media screen and (max-width: $pureg-md) {
    margin-bottom: 15px;
  }
}

.section__title__note {
  font-size: 0.8rem;
  color: $color-text-secondary;
  margin-left: 2rem;
  @media screen and (max-width: 600px) {
    font-size: 0.55rem;
    text-align: center;
    width: 120px;
    margin-left: auto;
  }
}

.section--split-left {
  padding-right: 15px;

  @media screen and (max-width: $pureg-md) {
    padding-right: 0px;
  }
}

.section--split-right {
  padding-left: 15px;
  @media screen and (max-width: $pureg-md) {
    padding-left: 0px;
  }
}

.section--lg-split-left {
  padding-right: 15px;

  @media screen and (max-width: $pureg-lg) {
    padding-right: 0px;
  }
}

.section--lg-split-right {
  padding-left: 15px;
  @media screen and (max-width: $pureg-lg) {
    padding-left: 0px;
  }
}

.section__header {
  padding: 0px 25px;
  border-bottom: 1px solid $color-border;
  min-height: 58px;
  display: flex;
  align-items: center;
  overflow-x: auto;
}

.tooltip__hover--info {
    font-size: 0.4em;
    width: 12px;
    height: 12px;
    background-color: rgb(120, 124, 161);
    padding: 3px;
    border-radius: 8px;
    color: rgb(27, 28, 41);
    vertical-align: middle;
    line-height: 1;
    margin-left: 4px;
}

.section__title--tooltip {
  position: relative;
  z-index: 10;

  .section__title__tooltip {
    display: none;
    position: absolute;
    top: -100%;
    left: 30px;
    background-color: $color-bg-popup;
    border-radius: 4px;
    width: 250px;
    text-transform: none;
  }

  .section__title__tooltip:before {
    content: "";
    position: absolute;
    width: 0px;
    height: 0px;
    border-top: 6px solid transparent;
    border-right: 6px solid $color-bg-popup;
    border-bottom: 6px solid transparent;
    top: calc(50% - 6px);
    left: -6px;
  }

  &:hover {
    .section__title__tooltip {
      display: block;
    }
  }

  &.section__title--tooltip--bottom {
    .section__title__tooltip {
      right: unset;
      left: unset;
      top: 30px;
    }
    .section__title__tooltip:before {
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid $color-bg-popup;
      top: -12px;
      left: calc(50%);
    }
  }
}

.section__title {
  font-size: 17px;
  font-weight: 600;
  flex: 1;
}

h2.section__title {
  text-transform: capitalize;
}

.section__header {
  @media screen and (max-width: 500px) {
    h2 {
      font-size: 14px !important;
    }
  }
}

.section__title__note {
  font-size: 12px;
  color: #A6B0C3;
}


.section__body--pie-chart {
  height: 300px;
  display: flex;
  padding-right: 25px;

  @media screen and (max-width: $pureg-lg) {
    height: 580px;
    padding-left: 25px;
  }
}

.section__body--area-chart {
  padding: 20px 25px;
}

.section__subtitle {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 20px;
}

.section__divider {
  border: 0;
  border-top: 1px solid $color-border;
  height: 1px;
  display: block;
}

/*
* TEXT
*/
.text__label {
  font-size: 12px;
  color: $color-text-secondary;
}

.text--bold {
  font-weight: 700;
}

/*
* SECTION TABLE
*/

.section__table {
  border-collapse: separate;
  border-spacing: 0;
  padding-bottom: 5px;

  td {
    border-top: 1px solid $color-border;
  }
}

.section__table__head {
  font-size: 11px;
  line-height: 15px;
  text-transform: uppercase;
  font-weight: 500;
  color: $color-text-secondary;
  text-align: left;
  padding: 8px 0;
  background-color: $color-bg-table-header;
}

.section__table__head--right {
  text-align: right
}

.section__table__row {
  border-top: 1px solid $color-border;
}

.section__table__row--will-churn-in {
  .section__table__data {
    background-color: $color-green-overlay;
  }
}
.section__table__row--will-churn {
  .section__table__data {
    background-color: $color-red-overlay;
  }
}
.section__table__score--will-churn-score {
  color: $color-red;
}
.bad-behavior-tooltip {
    display: none;
    position: absolute;
    top: -140px;
    right: 0;
    background-color: $color-bg-popup;
    font-size: 12px;
    border-radius: 4px;
    > .app-tooltip {
      width: 290px;
    }
}
.section__title__node--behavior {
  position: relative;
  &:hover {
    .bad-behavior-tooltip {
      display: block;
    }
  }
}


$padding-section-table: 25px;

.section__table__head:first-child {
  padding-left: $padding-section-table;
}

.section__table__head:last-child {
  padding-right: $padding-section-table;
}

.section__table__data {
  font-size: 14px;
  font-weight: 500;
  padding-top: 15px;
  padding-bottom: 15px;

  .churn-status--in {
    color: $color-green;
    font-weight: bold;
    text-transform: uppercase;
    max-width: 140px;
    overflow: hidden;
    display: block;
    text-align: center;
    font-size: 9px;
    max-height: 30px;
  }
  .churn-status--out {
    color: $color-red;
    font-weight: bold;
    text-transform: uppercase;
    max-width: 140px;
    overflow: hidden;
    display: block;
    text-align: center;
    font-size: 9px;
    max-height: 30px;
  }
}
.section__table__data--longvalue {
    display: inline-block;
    max-width: 300px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}
.section__table__data:first-child {
  padding-left: $padding-section-table;
}

.section__table__data:last-child {
  padding-right: $padding-section-table;
}

.section__table__data--highlight {
  font-weight: 700;
}

.section__table__data--right {
  text-align: right;
}

/*
 * CHARTS
 */

.pie-chart__container {
  padding-top: 30px;
}

/*
 * TOOLTIP FOR CHARTS
 */

.app-tooltip {
  background-color: $color-bg-popup;
  color: #fff;
  border: none;
  margin: 0;
  padding: 0;
  font-family: Montserrat;
  font-size: 11px;
  border-radius: 4px;
  width: 170px;
  font-weight: 400;
  box-shadow: 10px 10px 30px 0px rgba(0,0,0,0.4);
}

.app-tooltip__header {
  font-weight: 400;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  padding: 8px 0px;
  text-align: center;
}

.app-tooltip__body {
  padding: 10px 15px;
}

.app-tooltip__marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
}

.app-tooltip__table {
  width: 100%;
  boarder-collapse: collapse;
  td {
    padding-bottom: 6px;
    border-top: none;
  }
}

.app-tooltip__text {
  text-align: center;
  margin: 0;
  padding: 0;
}

.app-tooltip__table__data--highlight {
  font-weight: 600;
  text-align: right;
}

/*
 * COMMING SOON
 */

.coming-soon__parent {
  position: relative;
}

.coming-soon__target {
  filter: blur(10px);
}
</style>
