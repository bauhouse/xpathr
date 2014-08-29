function archive(unarchive) {
  /*global xpathr, $, $document, analytics*/
  'use strict';
  var type = unarchive === false ? 'unarchive' : 'archive';
  var text = unarchive === false ? 'restore from archive' : 'archiving';
  analytics[type](xpathr.getURL());
  if (!xpathr.user.name) {
    $document.trigger('tip', {
      type: 'notication',
      content: 'You must be logged in and the owner of the bin to archive.'
    });
  } else if (xpathr.owner()) {
    $.ajax({
      type: 'POST',
      url: xpathr.getURL() + '/' + type,
      error: function () {
        $document.trigger('tip', {
          type: 'error',
          content: 'The ' + text + ' failed. If this continues, please can you file an issue?'
        });
      },
      success: function () {
        xpathr.state.metadata.archive = unarchive !== false;
        updateArchiveMenu();
        $document.trigger('tip', {
          type: 'notication',
          autohide: 5000,
          content: 'This bin is now ' + (unarchive === false ? 'restored from the archive.' : 'archived.')
        });
      }
    });
  } else {
    $document.trigger('tip', {
      type: 'notication',
      content: 'The ' + text + ' failed. You can only archive bins that you own.'
    });
  }
}

function updateArchiveMenu() {
  if (xpathr.state.metadata && xpathr.state.metadata.archive) {
    $('a.archivebin').hide();
    $('a.unarchivebin').show();
  } else {
    $('a.archivebin').show();
    $('a.unarchivebin').hide();
  }
}

updateArchiveMenu();

var unarchive = archive.bind(null, false);