//= require "autocomplete"
//= require "../chrome/esc"

var keyboardHelpVisible = false;

var customKeys = objectValue('xpathr.settings.keys') || {};

$('#disablekeys').attr('checked', customKeys.disabled ? true : false).change(function () {
  if (!xpathr.settings.keys) {
    xpathr.settings.keys = {};
  }
  xpathr.settings.keys.disabled = this.checked;
});

if (!customKeys.disabled) $body.keydown(keycontrol);

var panelShortcuts = {}
//   49: 'javascript', // 1
//   50: 'css', // 2
//   51: 'html', // 3
//   52: 'console', // 4
//   53: 'live' // 5
// };
panelShortcuts.start = 48;

// work out the browser platform
var ua = navigator.userAgent;
if (/macintosh|mac os x/.test(ua)) { 
  $.browser.platform = 'mac'; 
} else if (/windows|win32/.test(ua)) { 
  $.browser.platform = 'win'; 
} else if (/linux/.test(ua)) { 
  $.browser.platform = 'linux'; 
} else { 
  $.browser.platform = ''; 
} 

// var closekey = $.browser.platform == 'mac' ? 167 : 192;

if (!customKeys.disabled) $document.keydown(function (event) {
  var includeAltKey = event.altKey, //customKeys.useAlt ? event.altKey : true,
      closekey = customKeys.closePanel ? customKeys.closePanel : 192
      $history = $('#history');

  if (event.ctrlKey) event.metaKey = true;

  if (event.metaKey && event.which == 79) {
    $('.homebtn').click();
    event.preventDefault();
  } else if (event.metaKey && event.which == 83) {
    if (event.shiftKey == false) {
      if (saveChecksum) {
        saveChecksum = false;
      } else {
        // trigger an initial save
        $('a.save:first').click();
      }
      event.preventDefault();
    } else if (event.shiftKey == true) {
      $('.clone').click();
      event.preventDefault();
    }
  } else if (event.which === closekey && event.metaKey && includeAltKey && xpathr.panels.focused) {
    if (xpathr.panels.focused.visible) xpathr.panels.focused.hide();
    var visible = xpathr.panels.getVisible();
    if (visible.length) {
      xpathr.panels.focused = visible[0];
      if (xpathr.panels.focused.editor) {
        xpathr.panels.focused.editor.focus();
      } else {
        xpathr.panels.focused.$el.focus();
      }
      xpathr.panels.focused.focus();
    } else if ($history.length && !$body.hasClass('panelsVisible')) {
      $body.toggleClass('dave', $history.is(':visible'));
      $history.toggle(100);
    }
  } else if (event.which === 220 && (event.metaKey || event.ctrlKey)) {
    xpathr.settings.hideheader = !xpathr.settings.hideheader;
    $body[xpathr.settings.hideheader ? 'addClass' : 'removeClass']('hideheader');
  } else if (event.which === 76 && event.ctrlKey && xpathr.panels.panels.console.visible) {
    if (event.shiftKey) {
      // reset
      jsconsole.reset();
    } else {
      // clear
      jsconsole.clear();
    }
  }
});

function keycontrol(event) {
  event = normalise(event);

  var panel = {};

  if (xpathr.panels.focused && xpathr.panels.focused.editor) {
    panel = xpathr.panels.focused.editor;
  } else if (xpathr.panels.focused) {
    panel = xpathr.panels.focused;
  }

  var codePanel = { css: 1, javascript: 1, html: 1}[panel.id],
      hasRun = false;

  var includeAltKey = event.altKey; //objectValue('xpathr.settings.keys.usealt') ? event.altKey : true;

  // these should fire when the key goes down
  if (event.type == 'keydown') {
    if (codePanel) {
      if (event.metaKey && event.which == 13) {
        if (editors.console.visible && !editors.live.visible) {
          hasRun = true;
          // editors.console.render();
          $('#runconsole').click();
        }
        if (editors.live.visible) {
          // editors.live.render(true);
          $('#runwithalerts').click();
          hasRun = true;
        }

        if (hasRun) {
          event.stop();
        } else {
          // if we have write access - do a save - this will make this bin our latest for use with
          // /<user>/last/ - useful for phonegap inject
          sendReload();
        }
      }
    }

    // shortcut for showing a panel
    if (panelShortcuts[event.which] !== undefined && event.metaKey && includeAltKey) {
      xpathr.panels.show(panelShortcuts[event.which]);
      event.stop();
    }

    if (event.which == 191 && event.metaKey && event.shiftKey) {
      // show help
      $body.toggleClass('keyboardHelp');
      keyboardHelpVisible = $body.is('.keyboardHelp');
      if (keyboardHelpVisible) {
        analytics.help();
      }
      event.stop();
    } else if (event.which == 27 && keyboardHelpVisible) {
      $body.removeClass('keyboardHelp');
      keyboardHelpVisible = false;
      event.stop();
    } else if (event.which == 27 && xpathr.panels.focused && codePanel) {
      // event.stop();
      // return CodeMirror.commands.autocomplete(xpathr.panels.focused.editor);
    } else if (event.which == 190 && includeAltKey && event.metaKey && panel.id == 'html') {
      // auto close the element
      if (panel.somethingSelected()) return;
      // Find the token at the cursor
      var cur = panel.getCursor(false), token = panel.getTokenAt(cur), tprop = token;
      // If it's not a 'word-style' token, ignore the token.
      if (!/^[\w$_]*$/.test(token.string)) {
        token = tprop = {start: cur.ch, end: cur.ch, string: "", state: token.state,
                         className: token.string == "." ? "js-property" : null};
      }
    
      panel.replaceRange('</' + token.state.htmlState.context.tagName + '>', {line: cur.line, ch: token.end}, {line: cur.line, ch: token.end});
      event.stop();
    } else if (event.which == 188 && event.ctrlKey && event.shiftKey && codePanel) {
      // start a new tag
      event.stop();
      return startTagComplete(panel);
    } else if (event.which == 191 && event.metaKey && codePanel) {
      // auto close the element
      if (panel.somethingSelected()) return;
      
      var cur = panel.getCursor(false), 
          token = panel.getTokenAt(cur),
          type = token && token.state && token.state.htmlState && token.state.htmlState.context && token.state.htmlState.context.tagName ? token.state.htmlState.context.tagName : 'script',
          line = panel.getLine(cur.line);

      if (token && token.state && token.state.htmlState && token.state.htmlState.context == null) {
        type = 'html';
      }
      
      if (type == 'style') {
        if (line.match(/\s*\/\*/) !== null) {
          // already contains comment - remove
          panel.setLine(cur.line, line.replace(/\/\*\s?/, '').replace(/\s?\*\//, ''));
        } else {
          panel.setLine(cur.line, '/* ' + line + ' */');
        }
      } else if (type == 'script') {
        // FIXME - could put a JS comment next to a <script> tag
        if (line.match(/\s*\/\//) !== null) {
          // already contains comment - remove
          panel.setLine(cur.line, line.replace(/(\s*)\/\/\s?/, '$1'));
        } else {
          panel.setLine(cur.line, '// ' + line);
        }      
      } else {
        if (line.match(/\s*<!--/) !== null) {
          // already contains comment - remove
          panel.setLine(cur.line, line.replace(/<!--\s?/, '').replace(/\s?-->/, ''));
        } else {
          panel.setLine(cur.line, '<!-- ' + line + ' -->');
        }      
      }

      event.stop();
    }
  }
  // return true;
  
  if (event.stopping) {
    return false;
  }
}

function normalise(event) {
  var myEvent = {
    type: event.type,
    which: event.which,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
    orig: event
  };

  if ( event.which == null && (event.charCode != null || event.keyCode != null) ) {
    myEvent.which = event.charCode != null ? event.charCode : event.keyCode;
  }

  // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
  if ( !event.metaKey && event.ctrlKey ) {
    myEvent.metaKey = event.ctrlKey;
  }

  // this is retarded - I'm having to mess with the event just to get Firefox
  // to send through the right value. i.e. when you include a shift key modifier
  // in Firefox, if it's punctuation - event.which is zero :(
  // Note that I'm only doing this for the ? symbol + ctrl + shift
  if (event.which === 0 && event.ctrlKey === true && event.shiftKey === true && event.type == 'keydown') {
    myEvent.which = 191;
  }

  var oldStop = event.stop;
  myEvent.stop = function () {
    myEvent.stopping = true;
    oldStop && oldStop.call(event);
  };

  return myEvent;
}