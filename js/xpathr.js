var xpathr = {
  "root":".",
  "static":".",
  "version":"debug",
  "state":{
    "token":"OXZiHN7dYqvuS9EpQIpr3sPE",
    "stream":false,
    "code":null,
    "revision":null,
    "processors":{}
  },
  "settings":{"panels":[]}
};
tips = {};

xpathr.getURL = function () {
  var url = xpathr.root,
      state = xpathr.state;

  if (state.code) {
    url += '/' + state.code;

    if (state.revision) { //} && state.revision !== 1) {
      url += '/' + state.revision;
    }
  }
  return url;
};

var $body = $('body'),
    $document = $(document),
    debug = xpathr.settings.debug === undefined ? false : xpathr.settings.debug,
    documentTitle = 'xpathr',
    $bin = $('#bin'),
    loadGist,
    $document = $(document),
    // splitterSettings = JSON.parse(localStorage.getItem('splitterSettings') || '[ { "x" : null }, { "x" : null } ]'),
    unload = function () {
      // sessionStorage.setItem('javascript', editors.javascript.getCode());
      if (xpathr.panels.focused.editor) {
        try { // this causes errors in IE9 - so we'll use a try/catch to get through it
          sessionStorage.setItem('line', xpathr.panels.focused.editor.getCursor().line);
          sessionStorage.setItem('character', xpathr.panels.focused.editor.getCursor().ch);
        } catch (e) {
          sessionStorage.setItem('line', 0);
          sessionStorage.setItem('character', 0);
        }
      }
      
      sessionStorage.setItem('url', xpathr.getURL());
      localStorage.setItem('settings', JSON.stringify(xpathr.settings));

      // if (xpathr.panels.saveOnExit) ;
      xpathr.panels.save();
      xpathr.panels.savecontent();

      var panel = xpathr.panels.focused;
      if (panel) sessionStorage.setItem('panel', panel.id);
    };

$(window).unload(unload);

if (!xpathr.settings.editor) {
  xpathr.settings.editor = {};
}

if (xpathr.settings.codemirror) {
  $.extend(xpathr.settings.editor, xpathr.settings.codemirror);
}

if (xpathr.settings.editor.theme) {
  $(document.documentElement).addClass('cm-s-' + xpathr.settings.editor.theme);
}