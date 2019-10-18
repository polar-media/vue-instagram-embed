/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
export default {
  name: 'vue-instagram-embed',
  props: {
    url: {
      type: String,
    },
    maxWidth: {
      type: Number,
      default: 320
    },
    hideCaption: {
      type: Boolean,
      default: false
    },
    omitScript: {
      type: Boolean,
      default: true
    },
    className: {
      type: String
    }
  },
  data() {
    return {
      html: ''
    };
  },
  mounted() {
    if (window.instgrm) {
      this.fetchEmbed();
    } else {
      this.injectScript();
      this.checkAPI().then(() => {
        this.fetchEmbed();
      })
    }
  },
  methods: {
    fetchEmbed() {
      this.validateUrl();
      const maxWidth = this.maxWidth >= 320 ? this.maxWidth : 320
      const url = `https://api.instagram.com/oembed?url=${this.url}&maxwidth=${maxWidth}&hidecaption=${this.hideCaption}&omitscript=${this.omitScript}`;
      fetch(url)
        .then(res => {
          if (res.ok) {
            return res.json();
          }
        })
        .then(data => {
          this.html = data.html;
          this.$nextTick(() => {
            window.instgrm.Embeds.process();
          });
        })
        .catch(e => {
          throw new Error(e);
        })
    },
    validateUrl() {
      const urlRe = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
      if (!urlRe.test(this.url)) {
        throw new Error(`${this.url} - Invalid url`);
      }
    },
    /**
     * inject instagram embed script
     */
    injectScript() {
      const protocolToUse = 'https:';
      const s = document.createElement('script');
      s.async = s.defer = true;
      s.src = `${protocolToUse}//www.instagram.com/embed.js`;
      s.id = 'vue-instagram-embed-script';
      const body = document.body;
      if (body) {
        body.appendChild(s);
      }
    },
    /**
     * Check for window.instgrm
     */
    checkAPI() {
      return new Promise(resolve => {
        (function checkAPI(self) {
          self.timer = window.setTimeout(() => {
            if (window.instgrm) {
              clearTimeout(self.timer);
              resolve();
            } else {
              checkAPI(self);
            }
          }, 20);
        })(this);
      });
    }
  },
  render () {
    return (
      <div class={this.className} domPropsInnerHTML={this.html}></div>
    )
  }
}
