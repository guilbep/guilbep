<template>
  <section>
    <form
      ref="contactForm"
      class="contact-form"
      name="contact-form"
      action="mailto:contact@pierreguilbert.com"
      method="GET"
      enctype="text/html"
    >
      <label>Name: </label>
      <input v-model="name" type="text" name="name" size="100" />
      <!-- hidden input to customize the subject of the email -->
      <input
        style="display:none"
        type="text"
        name="subject"
        size="100"
        :value="subject"
      />
      <label>Email: </label>
      <input v-model="email" type="mail" name="cc" size="1000" />

      <label>Message: </label>
      <textarea
        id="message"
        v-model="message"
        name="body"
        cols="30"
        rows="10"
      ></textarea>
      <div class="contact-form__submit-group">
        <button type="submit">Submit</button>
        <input type="reset" value="Reset" />
      </div>
    </form>
  </section>
</template>

<script>
export default {
  name: 'Page',
  data() {
    return {
      contactEmail: `contact@pierreguilbert.com`,
      name: '',
      email: '',
      message: ''
    };
  },
  computed: {
    subject() {
      return `[pierreguilbert.com--contact_page]:_from_${this.name}|${this.email}`;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.contact-form {
  // width should depend on max-width
  max-width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 0px;
  margin-bottom: 0px;
  padding: 0px 60px 0px 60px;
}

.contact-form__submit-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
</style>
