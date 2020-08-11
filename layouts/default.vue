<template>
  <div>
    <header class="header">
      <div class="header__content">
        <img src="/thorchain.svg" class="header__logo"></img>
        <a href="https://www.delphidigital.io/" target="_blank" class="header__logo">
          <img src="/powered_by_delphi.svg"></img>
        </a>
      </div>
    </header>
    <main>
      <Nuxt />
    </main>
  </div>
</template>

<style lang="scss" scoped>
.header {
  width: 100%;
  background-color: $color-bg;
  padding: 12px;
}

.header__content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
}

.header__logo {
  max-height: 45px;
  max-width: 45%;
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

/*
* PAGE
*/

.page__container {
  margin: 0 auto;
  width: 100%;
  max-width: 1200px;
  padding: 0 10px;
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
  height: 58px;
  display: flex;
  align-items: center;
}

.section__title {
  font-size: 17px;
  font-weight: 600;
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

.pie-chart__placeholder {
  height: 220px;
  width: 100%;
}

.area-chart__placeholder {
  height: 130px;
  width: 100%;
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
  font-size: 12px;
  border-radius: 4px;
  width: 170px;
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
