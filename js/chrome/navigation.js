var dropdownOpen = false,
    onhover = false,
    menuDown = false;

function opendropdown(el) {
  var menu;
  if (!dropdownOpen) {
    menu = $(el).closest('.menu').addClass('open').trigger('open');
    var input = menu.find(':text:visible:first').focus()[0];
    if (input) setTimeout(function () {
      input.select();
    }, 0);
    dropdownOpen = el;
  }
}

function closedropdown() {
  menuDown = false;
  if (dropdownOpen) {
    dropdownButtons.closest('.menu').removeClass('open').trigger('close');
    dropdownOpen = false;
    onhover = false;
  }
}

var dropdownButtons = $('.button-dropdown, .button-open').mousedown(function (e) {
  $dropdownLinks.removeClass('hover');
  if (dropdownOpen && dropdownOpen !== this) closedropdown();
  if (!dropdownOpen) {
    menuDown = true;
    opendropdown(this);
  }
  e.preventDefault();
  return false;
}).mouseup(function () {
  if (menuDown) return false;
}).click(function () {
  if (!menuDown) {
    closedropdown();
  }
  menuDown = false;
  return false;
});

$('#actionmenu').click(function () {
  dropdownOpen = true;
});

var ignoreUp = false;
$body.bind('mousedown', function (event) {
  if (dropdownOpen) {
    if ($(event.target).closest('.menu').length) {
      ignoreUp = true;
    }
  }
}).bind('click mouseup', function (event) {
  if (dropdownOpen && !ignoreUp) {
    if (!$(event.target).closest('.menu').length) {
      closedropdown();
      return false;
    }
  }
  ignoreUp = false;
});

var fromClick = false;
var $dropdownLinks = $('.dropdownmenu a').mouseup(function () {
  setTimeout(closedropdown, 0);
  if (!fromClick) {
    if (this.hostname === window.location.hostname) {
      if ($(this).triggerHandler('click') !== false) {
        window.location = this.href;
      }
    } else {
      if (this.getAttribute('target')) {
        window.open(this.href);
      } else {
        window.location = this.href;
      }
    }
  }
  fromClick = false;
}).mouseover(function () {
  $dropdownLinks.removeClass('hover');
  $(this).addClass('hover');
}).mousedown(function () {
  fromClick = true;
});