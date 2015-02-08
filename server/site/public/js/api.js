
function put(url, reload) {
  var http = null;
  http = new XMLHttpRequest();
  http.open('PUT', url, false);
  http.send(null);
  var results = http.responseText;
  console.log(results);
  if (reload) {
    location.reload();
  }
}


