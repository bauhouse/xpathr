// $('form').after('<div id="help"><div id="content"></div></div>');

var debug = false,
    $bin = $('#bin');

setScreenClass();
toggleLinks();

// Active toggle links for XML and XSLT code panels on large screens
function toggleLinks() {
  $('.large-screen #btn-xml').unbind('click').click(togglePanels);
  $('.large-screen #btn-xslt').unbind('click').click(togglePanels);
  $('.small-screen #btn-xml').unbind('click').click(togglePanelsSmallScreens);
  $('.small-screen #btn-xslt').unbind('click').click(togglePanelsSmallScreens);
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
  toggleLinks();
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

function togglePanels() {
  // determine which side was clicked
  var panel = $(this).is('#btn-xml') ? 'xml' : 'xslt',
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
    $(this).toggleClass('current');
  } else { // hiding other panel
    if ($(this).not('.current') && $bin.is('.' + otherpanel + '-only')) {
      animatePanel = panel == 'xslt' ? { left: '0', width: '100%' } : { left: '0', width: '100%' };
      animateOtherPanel = otherpanel == 'xml' ? { left: '-50%', width: '50%' } : { left: '100%', width: '50%' };
      $bin.find('div.' + panel).show().animate(animatePanel, speed);
      $bin.find('div.' + otherpanel).animate(animateOtherPanel, speed, function () {
        $bin.removeClass(otherpanel + '-only');
        $bin.addClass(panel + '-only');
        $('#btn-' + otherpanel).toggleClass('current');
        $('#btn-' + panel).toggleClass('current');
      }).hide();
    } else {
      animatePanel = panel == 'xslt' ? { left: '0%', width: '100%' } : { width: '100%' };
      animateOtherPanel = otherpanel == 'xml' ? { left: '-50%' } : { left: '100%' };
      $bin.find('div.' + panel).animate(animatePanel, speed);
      $bin.find('div.' + otherpanel).animate(animateOtherPanel, speed, function () { 
        $(this).hide();
        $bin.addClass(panel + '-only');
      });
      $(this).toggleClass('current');
    }
  }
  return false;
}

function togglePanelsSmallScreens() {
  var panel = $(this).is('#btn-xml') ? 'xml' : 'xslt',
      otherpanel = panel == 'xml' ? 'xslt' : 'xml';

  if ($bin.is('.' + panel + '-only')) { // showing the panel
    $bin.find('div.' + otherpanel).show();
    $bin.removeClass(panel + '-only');
    $(this).toggleClass('current');
  } else { // hiding other panel
    if ($(this).not('.current') && $bin.is('.' + otherpanel + '-only')) {
      $bin.find('div.' + panel).show();
      $bin.find('div.' + otherpanel).hide();
      $bin.removeClass(otherpanel + '-only');
      $bin.addClass(panel + '-only');
      $('#btn-' + otherpanel).toggleClass('current');
      $('#btn-' + panel).toggleClass('current');
    } else {
      $bin.find('div.' + otherpanel).hide();
      $bin.addClass(panel + '-only');
      $(this).toggleClass('current');
    }
  }
  return false;
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

/*
  if (helpOpen == false) {
    helpURL = $helpBtn.attr('href');
    $('#help #content').load(helpURL + '?' + Math.random());    
  }
*/

  $('#control').animate({ marginRight: right }, { duration: s });
  $bin.find('> div').animate({ right: right }, { duration: s });
  
  $('#help').animate({ right: helpOpen ? -300 : 0 }, { duration: s});
  
  helpOpen = helpOpen ? false : true;
});

$(document).keyup(function (event) {
  if (helpOpen && event.keyCode == 27) {
    $(window).trigger('togglehelp');
  }
});
