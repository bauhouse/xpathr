try {
  console.log('Dave is ready.');
} catch (e) {
  window.console = {
    log: function () {
      // alert([].slice.call(arguments).join('\n'));
    },
    warn: function () {},
    trace: function () {},
    error: function () {}
  };
}

// required because jQuery 1.4.4 lost ability to search my object property :( (i.e. a[host=foo.com])
jQuery.expr[':'].host = function(obj, index, meta, stack) {
  return obj.host == meta[3];
};

function throttle(fn, delay) {
  var timer = null;
  var throttled = function () {
    var context = this, args = arguments;
    throttled.cancel();
    throttled.timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };

  throttled.cancel = function () {
    clearTimeout(throttled.timer);
  };

  return throttled;
}

function debounceAsync(fn) {
  'use strict';
  var waiting = false;
  var last = null;

  return function debouceRunner() {
    var args = [].slice.call(arguments, 0);
    // console.time('tracker');

    var tracker = function () {
      waiting = false;
        // console.timeEnd('tracker');
      if (last) {
        // console.log('applying the last');
        fn.apply(last.context, last.args);
        // console.log('and now clear');
        last = null;
      }
    };

    // put the tracker in place of the callback
    args.push(tracker);

    if (!waiting) {
      // console.log('running this time...');
      waiting = true;
      return fn.apply(this, args);
    } else {
      // console.log('going to wait...');
      last = { args: args, context: this };
    }
  };
}

function escapeHTML(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

function dedupe(array) {
  var hash    = {},
      results = [],
      hasOwn  = Object.prototype.hasOwnProperty,
      i, item, len;

  for (i = 0, len = array.length; i < len; i += 1) {
    item = array[i];

    if (!hasOwn.call(hash, item)) {
      hash[item] = 1;
      results.push(item);
    }
  }

  return results;
}

function exposeSettings() {
  'use strict';

  function mockEditor (editor, methods) {
    return methods.reduce(function (mockEditor, method) {
      mockEditor[method] = editor[method].bind(editor);
      return mockEditor;
    }, {});
  }

  function mockPanels() {
    var results = {};
    var panels = xpathr.panels.panels;
    ['css', 'javascript', 'html'].forEach(function (type) {
      results[type] = {
        setCode: panels[type].setCode.bind(panels[type]),
        getCode: panels[type].getCode.bind(panels[type]),
        editor: mockEditor(panels[type].editor, [
          'setCursor',
          'getCursor',
          'addKeyMap',
          'on'
        ])
      };
    });

    return results;
  }

  if (window.xpathr instanceof Node || !window.xpathr) { // because...STUPIDITY!!!
    window.xpathr = {
      'static': xpathr['static'],
      version: xpathr.version,
      embed: xpathr.embed,
      panels: {
        // FIXME decide whether this should be locked down further
        panels: mockPanels()
      }
    }; // create the holding object

    if (xpathr.state.metadata && xpathr.user && xpathr.state.metadata.name === xpathr.user.name && xpathr.user.name) {
      window.xpathr.settings = xpathr.settings;
      return;
    }

    var key = 'o' + (Math.random() * 1).toString(32).slice(2);
    Object.defineProperty(window, key, {
      get:function () {
        window.xpathr.settings = xpathr.settings;
        console.log('xpathr.settings can how be modified on the console');
      }
    });
    if (!xpathr.embed) {
      console.log('To edit settings, type this string into the console: ' + key);
    }
  }
}

var storedSettings = localStorage.getItem('settings');
if (storedSettings === "undefined") {
  // yes, equals the *string* "undefined", then something went wrong
  storedSettings = null;
}

// In all cases localStorage takes precedence over user settings so users can
// configure it from the console and overwrite the server delivered settings
xpathr.settings = $.extend({}, xpathr.settings, JSON.parse(storedSettings || '{}'));

if (xpathr.user) {
  xpathr.settings = $.extend({}, xpathr.user.settings, xpathr.settings);
}

// if the above code isn't dodgy, this for hellz bells is:
xpathr.mobile = /WebKit.*Mobile.*|Android/.test(navigator.userAgent);
xpathr.tablet = /iPad/i.test(navigator.userAgent); // sue me.
// IE detect - sadly uglify is compressing the \v1 trick to death :(
// via @padolsey & @jdalton - https://gist.github.com/527683
xpathr.ie = (function(){
  var undef,
      v = 3,
      div = document.createElement('div'),
      all = div.getElementsByTagName('i');
  while (
    div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
    all[0]
  );
  return v > 4 ? v : undef;
}());

if (!storedSettings && (location.origin + location.pathname) === xpathr.root + '/') {
  // first timer - let's welcome them shall we, Dave?
  localStorage.setItem('settings', '{}');
}

if (!xpathr.settings.editor) {
  // backward compat with xpathr-v2
  xpathr.settings.editor = {};
}

if (xpathr.settings.codemirror) {
  $.extend(xpathr.settings.editor, xpathr.settings.codemirror);
}

if (xpathr.settings.editor.theme) {
  $(document.documentElement).addClass('cm-s-' + xpathr.settings.editor.theme.split(' ')[0]);
}

// Add a pre-filter to all ajax requests to add a CSRF header to prevent
// malicious form submissions from other domains.
jQuery.ajaxPrefilter(function (options, original, xhr) {
  var skip = {head: 1, get: 1};
  if (!skip[options.type.toLowerCase()] &&
      !options.url.match(/^https:\/\/api.github.com/)) {
    xhr.setRequestHeader('X-CSRF-Token', xpathr.state.token);
  }
});

xpathr.owner = function () {
  return xpathr.user && xpathr.user.name && xpathr.state.metadata && xpathr.state.metadata.name === xpathr.user.name;
};

xpathr.getURL = function (withoutRoot, share) {
  var url = withoutRoot ? '' : (share ? xpathr.shareRoot : xpathr.root),
      state = xpathr.state;

  if (state.code) {
    url += '/' + state.code;

    if (state.revision) { //} && state.revision !== 1) {
      url += '/' + state.revision;
    }
  }
  return url;
};

function objectValue(path, context) {
  var props = path.split('.'),
      length = props.length,
      i = 1,
      currentProp = context || window,
      value = currentProp[path];
  try {
    if (currentProp[props[0]] !== undefined) {
      currentProp = currentProp[props[0]];
      for (; i < length; i++) {
        if (currentProp[props[i]] === undefined) {
          break;
        } else if (i === length - 1) {
          value = currentProp[props[i]];
        }
        currentProp = currentProp[props[i]];
      }
    }
  } catch (e) {
    value = undefined;
  }

  return value;
}


var $window = $(window),
    $body = $('body'),
    $document = $(document),
    debug = xpathr.settings.debug === undefined ? false : xpathr.settings.debug,
    documentTitle = 'JS Bin',
    $bin = $('#bin'),
    loadGist,
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

      if (xpathr.panels.saveOnExit === false) {
        return;
      }
      xpathr.panels.save();
      xpathr.panels.savecontent();

      var panel = xpathr.panels.focused;
      if (panel) {
        sessionStorage.setItem('panel', panel.id);
      }
    };

$window.unload(unload);

// window.addEventListener('storage', function (e) {
//   if (e.storageArea === localStorage && e.key === 'settings') {
//     console.log('updating from storage');
//     console.log(JSON.parse(localStorage.settings));
//     xpathr.settings = JSON.parse(localStorage.settings);
//   }
// });

// hack for Opera because the unload event isn't firing to capture the settings, so we put it on a timer
if ($.browser.opera) {
  setInterval(unload, 500);
}

if (location.search.indexOf('api=') !== -1) {
  (function () {
    var urlParts = location.search.substring(1).split(','),
        newUrlParts = [],
        i = urlParts.length,
        apiurl = '';

    while (i--) {
      if (urlParts[i].indexOf('api=') !== -1) {
        apiurl = urlParts[i].replace(/&?api=/, '');
      } else {
        newUrlParts.push(urlParts[i]);
      }
    }

    $.getScript(xpathr.root + '/js/chrome/sandbox.js', function () {
      var sandbox = new Sandbox(apiurl);
      sandbox.get('settings', function (data) {
        $.extend(xpathr.settings, data);
        unload();
        window.location = location.pathname + (newUrlParts.length ? '?' + newUrlParts.join(',') : '');
      });
    });

  }());
}


$document.one('xpathrReady', function () {
  exposeSettings();
  $bin.removeAttr('style');
  $body.addClass('ready');
});

if (navigator.userAgent.indexOf(' Mac ') !== -1) (function () {
  var el = $('#keyboardHelp')[0];
  el.innerHTML = el.innerHTML.replace(/ctrl/g, 'cmd').replace(/Ctrl/g, 'ctrl');
})();

if (xpathr.embed) {
  $window.on('focus', function () {
    return false;
  });
}
