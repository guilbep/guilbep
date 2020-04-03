<template>
  <section class="welcome">
    <p>Welcome, I am</p>
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
}
</style>
