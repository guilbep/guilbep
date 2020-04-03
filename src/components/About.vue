<template>
  <section class="welcome">
    <h1>About me</h1>
    <hr />
    <p>
      I've been working full time in the web since 2013, first at numberly and
      now at prevision.io
    </p>
    <p>I graduated from Epita in 2011 from the SCIA master</p>

    <hr />
    <nav>
      <a href="#contact">contact me here!</a>
    </nav>
    <nav>
      <a href="https://github.com/guilbep" target="_blank">
        <i class="fab fa-github"></i>
      </a>
      <a href="https://gitlab.com/guilbep" target="_blank">
        <i class="fab fa-gitlab"></i>
      </a>
      <a href="https://www.linkedin.com/in/pguilbert/">
        <i class="fab fa-linkedin-in"></i>
      </a>
      <a href="https://twitter.com/pernicieux" target="_blank">
        <i class="fab fa-twitter"></i>
      </a>
      <a href="https://www.facebook.com/guilbep" target="_blank">
        <i class="fab fa-facebook-f"></i>
      </a>
    </nav>
  </section>
</template>

<script>
export default {
  name: 'Page'
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.welcome {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 0px 60px 0px 60px;
}
</style>
