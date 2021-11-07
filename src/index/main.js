import Vue from 'vue';
import Index from '@/index/Index.vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faGithub,
  faFacebook,
  faTwitter,
  faGitlab,
  faLinkedinIn
} from '@fortawesome/free-brands-svg-icons';

import {
  faBox,
  faBabyCarriage,
  faScroll,
  faFileCode,
  faFileAlt,
  faAt
} from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faGithub);
library.add(faFacebook);
library.add(faTwitter);
library.add(faGitlab);
library.add(faLinkedinIn);

library.add(faBabyCarriage);
library.add(faScroll);
library.add(faFileCode);
library.add(faBox);
library.add(faAt);
library.add(faFileAlt);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = true;

new Vue({
  render: h => h(Index)
}).$mount('#app');
