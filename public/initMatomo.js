if(window.env.ENV !== 'development') {
  var siteId = window.env.MATOMO.SITEID;
  var _paq = window._paq || [];

  _paq.push([function() {
    var self = this;
    function getOriginalVisitorCookieTimeout() {
      var now = new Date(),
        nowTs = Math.round(now.getTime() / 1000),
        visitorInfo = self.getVisitorInfo();
      var createTs = parseInt(visitorInfo[2]);
      var cookieTimeout = 33696000;
      var originalTimeout = createTs + cookieTimeout -
        nowTs;
      return originalTimeout;
    }
    this.setVisitorCookieTimeout( getOriginalVisitorCookieTimeout() );
  }]);

  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u= window.env.MATOMO.URL;
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', siteId]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
}
