<template>
  <div id="app">
    <Welcome id="welcome" class="page-wrapper" />
    <About id="about" class="page-wrapper" />
    <Contact id="contact" class="page-wrapper" />
  </div>
</template>

<script>
import Welcome from './components/Welcome.vue';
import About from './components/About.vue';
import Contact from './components/Contact.vue';

export default {
  name: 'App',
  components: {
    Welcome,
    About,
    Contact
  }
};
</script>

<style lang="scss">
:root {
  --main-bg-color: #e3e3e3;
  --main-text-color: #303030;
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

#app {
  font-family: var(--font-family-base);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: var(--header-top-height);
}

.page-wrapper {
  // if you have a border like below you need also to convert the height
  --properheight: calc(var(--border-default-height) * 2);
  --min-height-removal: calc(var(--header-top-height) + var(--properheight));
  min-height: calc(100vh - var(--min-height-removal));

  display: flex;
  justify-content: center;
  align-content: center;
  text-align: center;
  vertical-align: center;
  border: var(--border-default-height) solid gray;
  text-align: center;
}
</style>
