(function (global) {
  // Set up a namespace for our utility
  let ajaxUtils = {};

  // Returns an HTTP request object
  function getRequestObject() {
    if (window.XMLHttpRequest) {
      return new XMLHttpRequest();
    } else if (window.ActiveXObject) {
      return new ActiveXObject("Microsoft.XMLHTTP");
    } else {
      global.alert("Ajax is not supported!");
      return null;
    }
  }

  /**
   * Makes an Ajax GET request to 'requestUrl'
   * @param {String} requestUrl
   * @param {Function} responseHandler
   * @param {Boolean} isJsonResponse
   */
  ajaxUtils.sendRequest = function (
    requestUrl,
    responseHandler,
    isJsonResponse
  ) {
    /** @type XMLHttpRequest */
    let request = getRequestObject();
    request.onreadystatechange = function (response) {
      handleRequest(request, responseHandler, isJsonResponse);
    };
    request.open("GET", requestUrl, true);
    request.send(null); // for POST only
  };

  /**
   * Only calls user provided 'responseHandler'
   * function if response is ready and not an error
   * @param {XMLHttpRequest} request
   * @param {Function} responseHandler
   * @param {Boolean} isJsonResponse
   */
  function handleRequest(request, responseHandler, isJsonResponse) {
    if (request.readyState == 4 && request.status == 200) {
      // Default to isJsonResponse = true
      if (isJsonResponse == undefined) {
        isJsonResponse = true;
      }

      if (isJsonResponse) {
        responseHandler(JSON.parse(request.responseText));
      } else {
        responseHandler(request.responseText);
      }
    }
  }

  global.$ajaxUtils = ajaxUtils;
})(window);
