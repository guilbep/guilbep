<template>
  <nav class="nav">
    <a href="/" v-if="currentPage === 'blog'">
      Home
    </a>
    <a href="https://github.com/guilbep" target="_blank">
      <font-awesome-icon :icon="['fab', 'github']" />
    </a>
    <a href="mailto:contact@pierreguilbert.com"
      ><font-awesome-icon :icon="['fas', 'at']"
    /></a>
    <a href="https://gitlab.com/guilbep" target="_blank">
      <font-awesome-icon :icon="['fab', 'gitlab']" />
    </a>
    <a href="https://www.linkedin.com/in/pguilbert/">
      <font-awesome-icon :icon="['fab', 'linkedin-in']" />
    </a>
    <a href="https://twitter.com/pernicieux" target="_blank">
      <font-awesome-icon :icon="['fab', 'twitter']" />
    </a>
    <a href="https://www.facebook.com/guilbep" target="_blank">
      <font-awesome-icon :icon="['fab', 'facebook']" />
    </a>
    <a href="/blog" v-if="currentPage === 'home'">
      Blog
    </a>
  </nav>
</template>

<script>
export default {
  name: 'Nav',
  data() {
    return {
      currentLocation: document.location.pathname
    };
  },
  mounted() {
    this.currentLocation = document.location.pathname;
  },
  watch: {
    currentLocation: v => {
      console.log('watcher', v);
    }
  },
  computed: {
    currentPage() {
      return this.currentLocation === '/' ? 'home' : 'blog';
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.nav {
  display: flex;
  flex-direction: row;
  justify-content: right;
  gap: 10px;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 20px 20px 0px 20px;
}
a {
  color: var(--link-text-color);
  text-decoration: none;
  transition: all 0.25s ease;
  line-height: 1.35;
  border-radius: 3px;
  padding: 6px 12px;
  font-size: 16px;
  &:hover {
    text-decoration: none;
    color: var(--link-text-hover-color);
  }
}

@media only screen and (max-width: 640px) {
  .nav {
    padding: 20px 5px 0;
  }
  .nav a {
    padding: 8px 8px;
  }
}
</style>
