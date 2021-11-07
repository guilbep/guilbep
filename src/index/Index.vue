<template>
  <div id="index">
    <Nav id="nav" />
    <Header id="ḧeader" />
    <Main id="main" />
    <Footer id="footer" />
  </div>
</template>

<script>
import Nav from '@/components/Nav.vue';
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
import Main from '@/components/Main.vue';

export default {
  name: 'Index',
  components: {
    Nav,
    Header,
    Footer,
    Main
  }
};
</script>

<style lang="scss">
:root {
  --main-bg-color: #fff;
  --main-text-color: #303030;
  --secondary-text-color: #ccc;
  --link-text-color: #02a3a3;
  --link-text-important: var(--link-text-color);
  --link-text-hover-color: #132b6e;
  --font-family-base: Helvetica, Arial, sans-serif;
  --font-size-base: 12px;
  --font-weight-base: 300;
  --line-height-base: 2;

  // concerning the top header if we want one
  --header-top-height: 0px;
  --border-default-height: 1px;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-base);
  line-height: var(--line-height-base);
  color: var(--main-text-color);
  text-align: left;
  background-color: var(--main-bg-color);
}

#index {
  font-family: var(--font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: var(--header-top-height);

  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
