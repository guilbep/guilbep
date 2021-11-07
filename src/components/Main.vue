<template>
  <section class="main">
    <ol class="main-list">
      <li class="main-list-item">
        <div class="item-header">
          <font-awesome-icon class="item-image" :icon="['fas', 'info']" />
        </div>
        <div class="item-content">
          <div class="item-title">
            <h2>About me</h2>
          </div>
          <div class="item-description">
            <span>
              I have been working full time with the web platform since 2011.
            </span>
            <br />
            <span>
              My last project was at
              <a href="https://www.prevision.io/">Prevision.io</a> helping to
              scale their AI platform, building an amazing machine learning
              tool.
            </span>
            <br />
            <span>
              Previously I was lead dev at
              <a href="https://numberly.com/">Numberly</a> shaping their ad tech
              products as a dev-ops / full stack developer.
            </span>
          </div>
        </div>
      </li>
      <li class="main-list-item">
        <div class="item-header">
          <font-awesome-icon class="item-image" :icon="['fas', 'file-alt']" />
        </div>
        <div class="item-content">
          <div class="item-title">
            <h2>Curriculum Vitae</h2>
          </div>
          <div class="item-description">
            <span
              >I graduated from <a href="https://www.epita.fr/">EPITA</a> in
              2011 from the SCIA master.</span
            >
            <br />
            <span>
              I studied Biology and Modelisation at Paris VI between 2011 and
              2013 while working part time at the
              <a href="https://en.wikipedia.org/wiki/Internet_Memory_Foundation"
                >Internet Memory Fundation</a
              >
            </span>
            <br />
            You may find an updated version of my Curriculum with my contact
            infos:
            <br />
            <a
              href="/assets/PIERREGUILBERT2021CV_EN.pdf"
              download="PIERREGUILBERT2021CV_EN.pdf"
              >PierreGuilbertCV_english.pdf</a
            ><br />
            <a
              href="/assets/PIERREGUILBERT2021CV_FR.pdf"
              download="PIERREGUILBERT2021CV_FR.pdf"
              >PierreGuilbertCV_french.pdf</a
            >
            <br />
          </div>
        </div>
      </li>

      <li class="main-list-item">
        <div class="item-header">
          <font-awesome-icon
            class="item-image"
            :icon="['fas', 'baby-carriage']"
          />
        </div>
        <div class="item-content">
          <div class="item-title">
            <h2>Current project</h2>
          </div>
          <div class="item-description">
            <span>
              After spending the past few months taking care of my newborn
              child. I'm looking forward to start working again at 80% starting
              january 2022.
            </span>
          </div>
        </div>
      </li>
      <!-- <li class="main-list-item">
        <div class="item-header">
          <font-awesome-icon class="item-image" :icon="['fas', 'box']" />
        </div>
        <div class="item-content">
          <div class="item-title">
            <h2>Past projects</h2>
          </div>
          <div class="item-description">
            <p></p>
          </div>
        </div>
      </li>
      <li class="main-list-item">
        <div class="item-header">
          <font-awesome-icon class="item-image" :icon="['fas', 'file-code']" />
        </div>
        <div class="item-content">
          <div class="item-title">
            <h2>Open source</h2>
          </div>
          <div class="item-description">
            <p></p>
          </div>
        </div>
      </li> -->
      <li class="main-list-item">
        <div class="item-header">
          <font-awesome-icon class="item-image" :icon="['fas', 'scroll']" />
        </div>
        <div class="item-content">
          <div class="item-title">
            <h2>Blog</h2>
          </div>
          <div class="item-description">
            <p>
              My latests thoughts are written on my personal hosted domain. Main
              goal is to share knowledge and to catalog good ideas and
              practices. <a href="/blog"> Link to my blog</a>
            </p>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<script>
export default {
  name: 'Main'
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
a {
  color: var(--link-text-color);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    color: var(--link-text-hover-color);
  }
}

.main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 0px;
  margin-bottom: 0px;
  max-width: 650px;
  padding: 0px 20px 0px 20px;
}
.main-list {
  display: block;

  width: 100%;
  margin: 0;
  padding: 0;
}

.main-list-item {
  display: flex;
  padding-top: 24px;
  padding-bottom: 24px;
}

.item-description {
  line-height: 1.7;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  text-align: left;
}

.item-title {
  margin-bottom: 1.5rem;
  color: var(--main-text-color);
  text-align: left;
  h2 {
    font-size: 1.3rem;
    font-weight: 400;
  }
}
.item-content {
  display: block;
  width: 100%;
  padding: 3rem 0 3 rem;
}
.item-header {
  display: block;
  margin-top: 1.5rem;
  margin-right: 2rem;
}
.item-header .item-image {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
@media only screen and (max-width: 640px) {
  .item-header .item-image {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-size: cover;
  }
}
</style>
