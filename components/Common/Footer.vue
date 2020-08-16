<template>
  <div>
    <footer>
      Copyright © {{ year }} - <a href="https://www.delphidigital.io/" target="blank">Delphi Digital</a>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      year: new Date().getFullYear(),
    };
  },
};
</script>

<style lang="scss" scoped>
  footer {
    color: hsla(0,0%,100%,.5);
    font-size: 0.8rem;
    padding: 4rem 0 5rem 0;
    text-align: center;
    a {
      color: hsla(0,0%,100%,.5);
      text-decoration: none;
    }
  }
</style>
