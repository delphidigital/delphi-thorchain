<template>
  <div class="coming-soon">
    <svg width="30" height="25">
      <line x1="1" y1="13" x2="8" y2="5" class="coming-soon-stroke" />
      <line x1="1" y1="12" x2="8" y2="20" class="coming-soon-stroke" />
      <line x1="22" y1="5" x2="29" y2="13" class="coming-soon-stroke" />
      <line x1="22" y1="20" x2="29" y2="12" class="coming-soon-stroke" />
      <line
        x1="12"
        y1="24"
        x2="18"
        y2="1"
        class="coming-soon-stroke"
        stroke-linecap="round"
      />
    </svg>
    <p>Coming Soon...</p>
  </div>
</template>

<style lang="scss">
.coming-soon__parent {
  height: 100%;
  min-height: 160px;
}
.coming-soon {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: $color-text-secondary;

  p {
    text-transform: uppercase;
    margin: 10px 0 0 0;
    padding: 0;
    font-size: 16px;
    font-weight: 500;
    letter-spacing: 1px;
  }
}

.coming-soon-stroke {
  stroke: $color-text-secondary;
  stroke-width: 3;
}
</style>
