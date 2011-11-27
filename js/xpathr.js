var debug = false,
    $bin = $('#bin');

setScreenClass();
appendToggleLinks();

// Append toggle links for XML and XSLT code panels on large screens
function appendToggleLinks() {
  $('.large-screen .xml div.label p:not(:has(span))').append('<span> (<span class="hide">hide</span><span class="show">show</span> XSLT)</span>');
  $('.large-screen .xslt div.label p:not(:has(span))').append('<span> (<span class="hide">hide</span><span class="show">show</span> XML)</span>');
  $('.large-screen div.label p').click(togglePanels);
}

// Remove toggle links for XML and XSLT code panels on small screens
function removeToggleLinks() {
  $('.small-screen div.label p span').remove();
  $('.small-screen div.label p').unbind('click');
}

// Fix width of code editors when resizing smaller than 768px
var TO = false;
$(window).resize(function() {
  setScreenClass();
  resetPanelWidths();

  // Run resizeComlete() function only when the window resize is complete
  // http://stackoverflow.com/questions/667426/javascript-resize-event-firing-multiple-times-while-dragging-the-resize-handle/668185#668185
  if(TO !== false)
    clearTimeout(TO);
  TO = setTimeout(resizeComplete, 200); //200 is time in miliseconds
});

// Add or remove toggle links for code panels
function resizeComplete() {
  if($(window).width() < 768) {
    removeToggleLinks();
  } else {
    appendToggleLinks();
  }
}

// Set screen size class on body element
function setScreenClass() {
  if($(window).width() < 768) {
    $('body').addClass('small-screen').removeClass('large-screen');
  } else {
    $('body').addClass('large-screen').removeClass('small-screen');
  }
}

function resetPanelWidths() {
  $('.small-screen .code').css({ left: '0', width: '100%' });
  $('.large-screen .xml').css({ left: '0', width: '50%' });
  $('.large-screen .xslt').css({ left: '50%', width: '50%' });
  $('.xml-only .xslt').css({ left: '100%', width: '50%' });
  $('.xml-only .xml').css({ left: '0', width: '100%' });
  $('.xslt-only .xslt').css({ left: '0', width: '100%' });
  $('.xslt-only .xml').css({ left: '-50%', width: '50%' });
}

// Toggle Panels
$('.large-screen div.label p').click(togglePanels);

function togglePanels() {
  // determine which side was clicked
  var panel = $(this).closest('.code').is('.xml') ? 'xml' : 'xslt',
      otherpanel = panel == 'xml' ? 'xslt' : 'xml',
      mustshow = $bin.is('.' + panel + '-only'),
      speed = 150,
      animatePanel = animateOtherPanel = {};
  
  if ($bin.is('.' + panel + '-only')) { // showing the panel
    // only the xslt tab could have been clicked
    animatePanel = panel == 'xslt' ? { left: '50%', width: '50%' } : { left: '0%', width: '50%' };
    animateOtherPanel = otherpanel == 'xml' ? { left: '0%' } : { left: '50%' };
    $bin.find('div.' + panel).animate(animatePanel, speed);
    $bin.find('div.' + otherpanel).show().animate(animateOtherPanel, speed, function () {
      $bin.removeClass(panel + '-only');
    });
  } else { // hiding other panel
    animatePanel = panel == 'xslt' ? { left: '0%', width: '100%' } : { width: '100%' };
    animateOtherPanel = otherpanel == 'xml' ? { left: '-50%' } : { left: '100%' };
    
    $bin.find('div.' + panel).animate(animatePanel, speed);
    $bin.find('div.' + otherpanel).animate(animateOtherPanel, speed, function () { 
      $(this).hide();
      $bin.addClass(panel + '-only');
    });
  }
}

// Reset Panels
function resetPanels() {
  $('.small-screen .xml').show();
  $('.small-screen .xslt').show();
  $('.large-screen .xml').show();
  $('.large-screen .xslt').show();
  $bin.removeClass('xml-only').removeClass('xslt-only');
}

// Toggle Help
$('#control div.help a:last').click(function () {
  $(window).trigger('togglehelp');
  return false;
});

var helpOpen = false;
$(window).bind('togglehelp', function () {
  var s = 100, right = helpOpen ? 0 : 300;

  if (helpOpen == false) {
    $('#help #content').load('help/index.html?' + Math.random());    
  }
  $bin.find('> div').animate({ right: right }, { duration: s });
  $('#control').animate({ right: right }, { duration: s });
  
  $('#help').animate({ right: helpOpen ? -300 : 0 }, { duration: s});
  
  helpOpen = helpOpen ? false : true;
});

$(document).keyup(function (event) {
  if (helpOpen && event.keyCode == 27) {
    $(window).trigger('togglehelp');
  }
});


// Show Result
$('#control .result').click(function() {
  $('body').removeClass('source').addClass('result');
  window.scrollTo(0, 0);
})


// Show Source
$('#control .source').click(function() {
  $('body').removeClass('result').addClass('source');
  window.scrollTo(0, 0);
})