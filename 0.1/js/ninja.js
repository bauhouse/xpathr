var debug = false,
    $bin = $('#bin');

// Toggle Panels
$('div.label p').click(function () {
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
});


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