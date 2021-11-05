<template>
  <header class="profile-information">
    <a href="mailto:contact@pierreguilbert.com">
      <img id="avatar" class="2x" src="/assets/pgu.jpeg" />
    </a>

    <h1>Pierre Guilbert</h1>
    <h2>Engineering Web app since <span class="important">2011</span></h2>
    <hr />
  </header>
</template>

<script>
export default {
  name: 'Header'
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.profile-information {
  display: flex;
  max-width: 650px;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 100px 20px 0px 20px;
}

@media only screen and (max-width: 640px) {
  .profile-information {
    padding: 40px 20px 0px 20px;
  }
}

.profile-information #avatar {
  display: inline-block;
  width: 10em;
  height: 10em;
  border-radius: 50%;
  margin-bottom: 1em;
}
.profile-information h2 {
  margin-top: 0.12em;
  font-weight: 400;
  color: #bbb;
}
.profile-information h2 .important {
  color: var(--link-text-important);
}
hr {
  border: 1px solid #bbb;
  width: 100%;
}
</style>
