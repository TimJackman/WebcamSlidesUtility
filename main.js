let isWebcamVisible = false;
let isToggling = false;
let hasToggledWebcam = false;
let hasToggledSlides = false;
let viewportWidth = $(window).width();
let viewportHeight = $(window).height();

function loadURL() {
  let slides = document.getElementById('slideshow');
  let slidesContainer = document.getElementById('slideshowContainer')
  let url = document.getElementById('url').value;
  console.log(url);
  if (url.includes("pub?start=")) {
  let endPos = url.indexOf("pub?start=")
    url = url.substring(0, endPos) + 'embed';
  } else if (url.includes("<iframe src=")) {
    url = url.slice(url.indexOf("\"" + 1), url.indexOf("?start" -1));
  } else if (url.includes("edit")) {
   let endPos = url.indexOf("edit")
    url = url.substring(0,endPos) + 'embed';
  }
  console.log(url);
  slides.src = url;
}

function toggleContainer(){
  if (!hasToggledWebcam) {
    let container = document.getElementById('container');
    container.style.left = viewportWidth * 0.01 + "px";
    container.style.top = viewportHeight * 0.175 + "px";
    container.style.zIndex = 100;
    hasToggledWebcam = !hasToggledWebcam;
  }
  $( "#container" ).toggle("clip",500);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 1000);
  });
}

function toggleWebcam(){
  let video = document.getElementById("videoElement");
  if (!isWebcamVisible && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true})
      .then(function (stream) {
        video.srcObject = stream;
        isWebcamVisible = !isWebcamVisible
      })
      .catch(function (err0r) {
        alert("Unable to access webcam. Please make sure it is not already in use on Zoom.")
      })
  } else if (isWebcamVisible) {
    let stream = document.getElementById("videoElement").srcObject;
    let tracks = stream.getTracks();

    for (let i = 0; i < tracks.length; i++) {
      let track = tracks[i];
      track.stop();
    }
    document.getElementById("videoElement").srcObject = null
    isWebcamVisible = !isWebcamVisible;
  }
  let promiseDelay;
  if (isWebcamVisible) {
    promiseDelay = 100;
  } else {
    promiseDelay = 1500;
  }
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, promiseDelay);
  });
}


$( function() {
  $("#toggleWebcam").on("click", async function () {
    if (!isToggling) {
      isToggling = true;
      if (isWebcamVisible) {
        await toggleContainer();
        await toggleWebcam();
      } else {
        await toggleWebcam();
        await toggleContainer();
      }
      isToggling = false;
    }
  });
  $( "#container" ).resizable({
    aspectRatio: 4 / 3
  });
  $( "#container" ).draggable();

  $( "#slideshowContainer").resizable({
    aspectRatio: 16 / 9
  })
  $( "#slideshowContainer").draggable();
} );

$( function() {
  $( "#collapseURL").on( "click", function() {
    $( "#menu").toggle("blind", 200);
  })

  $( "#submit").on( "click", function() {
    let container = document.getElementById('slideshowContainer');
    let width = viewportWidth * 0.80;
    let height = width / 16 * 9;
    let maxHeight = viewportHeight * 0.75;
    if (height > maxHeight) {
      height = maxHeight;
      width = maxHeight / 9 * 16;
    }
    container.style.width = width + "px";
    container.style.height = height + "px";
    container.style.left = (viewportWidth - width)/2 + "px";
    $( "#slideshowContainer").show();
    loadURL();
  })
})

$("#url").keyup(function(event) {
  if (event.key === 'Enter') {
    $("#submit").click();
  }
});

$(window).resize(function() {
  var viewportWidth = $(window).width();
  var viewportHeight = $(window).height();
});



