$('form').after('<div id="help"><div id="content"></div></div>');

var debug = false,
    $bin = $('#bin');

setScreenClass();
appendToggleLinks();

// Append toggle links for XML and XSLT code panels on large screens
function appendToggleLinks() {
  $('.xml div.label p:not(:has(span))').append('<span> (<span class="hide">hide</span><span class="show">show</span> XSLT)</span>');
  $('.xslt div.label p:not(:has(span))').append('<span> (<span class="hide">hide</span><span class="show">show</span> XML)</span>');
  $('.large-screen div.label p').unbind('click').click(togglePanels);
  $('.small-screen div.label p').unbind('click').click(togglePanelsSmallScreens);
}

// Fix width of code editors when resizing smaller than 768px
var TO = false;
$(window).resize(function() {
  setScreenClass();
  resetPanelMetrics();

  // Run resizeComlete() function only when the window resize is complete
  // http://stackoverflow.com/questions/667426/javascript-resize-event-firing-multiple-times-while-dragging-the-resize-handle/668185#668185
  if(TO !== false)
    clearTimeout(TO);
  TO = setTimeout(resizeComplete, 200); //200 is time in miliseconds
});

// Add or remove toggle links for code panels
function resizeComplete() {
  appendToggleLinks();
}

// Set screen size class on body element
function setScreenClass() {
  if($(window).width() < 768) {
    $('body').addClass('small-screen').removeClass('large-screen');
  } else {
    $('body').addClass('large-screen').removeClass('small-screen');
  }
}

function resetPanelMetrics() {
  $('.large-screen .xml').css({ left: '0', width: '50%' });
  $('.large-screen .xslt').css({ left: '50%', width: '50%' });
  $('.xml-only .xslt').css({ left: '100%', width: '50%' });
  $('.xml-only .xml').css({ left: '0', width: '100%' });
  $('.xslt-only .xslt').css({ left: '0', width: '100%' });
  $('.xslt-only .xml').css({ left: '-50%', width: '50%' });
  $('.small-screen .code').css({ left: '0', width: '100%' });
}

// Toggle Panels
$('.large-screen div.label p').click(togglePanels);

function togglePanels() {
  // determine which side was clicked
  var panel = $(this).closest('.code').is('.xml') ? 'xml' : 'xslt',
      otherpanel = panel == 'xml' ? 'xslt' : 'xml',
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

function togglePanelsSmallScreens() {
  var panel = $(this).closest('.code').is('.xml') ? 'xml' : 'xslt',
      otherpanel = panel == 'xml' ? 'xslt' : 'xml';
  
  if ($bin.is('.' + panel + '-only')) { // showing the panel
    // alert('One panel is closed');
    $bin.find('div.' + otherpanel).show();
    $bin.removeClass(panel + '-only');
  } else { // hiding other panel
    // alert('Both panels are open');
    $bin.find('div.' + otherpanel).hide();
    $bin.addClass(panel + '-only');
  }
}

// Toggle Help
$helpBtn = $('#header div.help a:last');
$helpBtn.click(function () {
  $(window).trigger('togglehelp');
  return false;
});

var helpOpen = false;
$(window).bind('togglehelp', function () {
  var s = 100, right = helpOpen ? 0 : 300;

  if (helpOpen == false) {
    helpURL = $helpBtn.attr('href');
    $('#help #content').load(helpURL + '?' + Math.random());    
  }
  $('#header').animate({ marginRight: right }, { duration: s });
  $('#control').animate({ right: right }, { duration: s });
  $bin.find('> div').animate({ right: right }, { duration: s });
  
  $('#help').animate({ right: helpOpen ? -300 : 0 }, { duration: s});
  
  helpOpen = helpOpen ? false : true;
});

$(document).keyup(function (event) {
  if (helpOpen && event.keyCode == 27) {
    $(window).trigger('togglehelp');
  }
});



// Show XML
$('#control .btn-xml').click(function() {
  $('body').removeClass('show-xslt').removeClass('show-result').addClass('show-xml');
  window.scrollTo(0, 0);
})

// Show XSLT
$('#control .btn-xslt').click(function() {
  $('body').removeClass('show-xml').removeClass('show-result').addClass('show-xslt');
  window.scrollTo(0, 0);
})

// Show Result
$('#control .btn-result').click(function() {
  $('body').removeClass('show-xml').removeClass('show-xslt').addClass('show-result');
  window.scrollTo(0, 0);
})

