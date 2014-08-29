var githubIssue = (function () {
/*global $:true, xpathr:true */
  'use strict';

  function githubIssue() {
    var url = 'http://github.com/xpathr/xpathr/issues/new';
    var body = ['Please provide any additional information, record a screencast ',
               'with http://quickcast.io or http://screenr.com and attach a screenshot ',
               'if possible.\n\n**JS Bin info**\n\n* [%url%](%url%)\n* ',
               window.navigator.userAgent + '\n',
               (xpathr.user && xpathr.user.name ? '* ' + xpathr.user.name : ''),
               '\n'].join('');

    return url + '?body=' + encodeURIComponent(body.replace(/%url%/g, xpathr.getURL()));
  }

  var $newissue = $('#newissue');

  $('#help').parent().on('open', function () {
    $newissue.attr('href', githubIssue());
  });

  return githubIssue;
})();