import Vue from 'vue';
import Blog from '@/blog/Blog.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faGithub,
  faFacebook,
  faTwitter,
  faGitlab,
  faLinkedinIn
} from '@fortawesome/free-brands-svg-icons';

import { faAt } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faGithub);
library.add(faFacebook);
library.add(faTwitter);
library.add(faGitlab);
library.add(faLinkedinIn);
library.add(faAt);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = true;

new Vue({
  render: h => h(Blog)
}).$mount('#app');
