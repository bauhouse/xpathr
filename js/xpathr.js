var jsbin = {"root":".","static":".","version":"debug","state":{"token":"OXZiHN7dYqvuS9EpQIpr3sPE","stream":false,"code":null,"revision":null,"processors":{}},"settings":{"panels":[]}}; tips  = {};

xpathr.getURL = function () {
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
