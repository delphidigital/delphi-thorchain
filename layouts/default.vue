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
