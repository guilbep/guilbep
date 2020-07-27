<template>
  <section class="welcome">
    <h1>Pierre Guilbert</h1>
    <p>Engineering web app</p>
    <hr />
    <nav>
      <a href="#contact">Have an idea to develop ? contact me</a>
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

  background-size: cover;
  background-image: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.824),
      rgba(128, 128, 128, 0.872)
    ),
    url('/assets/large.jpg');
}
</style>
