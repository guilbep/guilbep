<template>
  <footer>
    <hr />
    <p class="footer-content">
      © Copyright 2021
      <a href="mailto:contact@pierreguilbert.com">Pierre Guilbert</a>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
footer {
  padding: 0px 20px 0px 20px;
  max-width: 650px;
}
.footer-content {
  color: var(--secondary-text-color);
  margin-top: 1rem;
  margin-bottom: 1rem;
  text-align: left;
  font-size: 0.625rem;
}
hr {
  border: 1px solid #bbb;
  width: 100%;
}
a {
  color: var(--link-text-color);
  text-decoration: none;
  transition: all 0.25s ease;
  border-radius: 3px;
  &:hover {
    text-decoration: none;
    color: var(--link-text-hover-color);
  }
}
</style>
