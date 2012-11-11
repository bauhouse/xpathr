jsbin.getURL = function () {
  var url = jsbin.root,
      state = jsbin.state;

  if (state.code) {
    url += '/' + state.code;

    if (state.revision) { //} && state.revision !== 1) {
      url += '/' + state.revision;
    }
  }
  return url;
};

