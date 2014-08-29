$('#download').click(function (event) {
  event.preventDefault();
  window.location = xpathr.getURL() + '/download';
  analytics.download();
});
