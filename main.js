let isWebcamVisible = false;
let isToggling = false;
let hasToggledWebcam = false;
let hasToggledSlides = false;
let fullscreenHeight = window.screen.height;
let fullscreenWidth = window.screen.width;
let viewportWidth = $( window ).width();
let viewportHeight = $( window ).height();
let slideHeight;
let slideWidth;
let slideOffset;

function loadURL() {
    let slides = document.getElementById('slideshow');
    let url = document.getElementById('url').value;

    if (url.includes("pub?start=")) {
        let endPos = url.indexOf("pub?start=")
        url = url.substring(0, endPos) + 'embed?rm=minimal';
    } else if (url.includes("<iframe src=")) {
        url = url.slice(url.indexOf("\"" + 1), url.indexOf("?start" -1));
    } else if (url.includes("edit")) {
        let endPos = url.indexOf("edit")
        url = url.substring(0,endPos) + 'embed?rm=minimal';
    }

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
}

function toggleWebcam(){
    let video = document.getElementById("videoElement");
    if (!isWebcamVisible && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true})
            .then(function (stream) {
                video.srcObject = stream;

                isWebcamVisible = !isWebcamVisible

            }).catch(function (err0r) {
                alert("Your webcam is unavailable. Please make sure it is not in use by another program, such as Zoom.");
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
    let promiseDelay = 1500;
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
            $( "#spin").show();
            if (isWebcamVisible) {
                await toggleContainer();
                setTimeout("toggleWebcam()",1500);
            } else {
                await toggleWebcam();
                if (isWebcamVisible){
                await toggleContainer();
                }
            }
            setTimeout(() => {isToggling = false;}, 1500);
            $( "#spin" ).hide();
        }
    });
    $( "#container" ).resizable({
        aspectRatio:  4 / 3
    });
    $( "#container" ).draggable({
        containment: "parent",
        ghost: true,
        handles: 'ne, se, sw, nw'
    });

    //$( "#slideshowContainer").resizable({
        //aspectRatio: 16 / 9
    //})
    // $( "#slideshowContainer").draggable();
} );

$( function() {
    $( "#collapseURL").on( "click", function() {
        $( "#menu").toggle("blind", 200);
    })

    $( "#submit").on( "click", function() {
        let container = document.getElementById('slideshowContainer');
        /*let width = viewportWidth * 0.80;
        let height = width / 16 * 9;
        let maxHeight = viewportHeight * 0.75;
        if (height > maxHeight) {
            height = maxHeight;
            width = maxHeight / 9 * 16;
        }
        container.style.width = width + "px";
        container.style.height = height + "px";
        container.style.left = (viewportWidth - width)/2 + "px";*/
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

document.addEventListener("keypress", function(e) {
    if (e.code === "KeyF") {
        toggleFullScreen();
    }
}, false);

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        let slide = document.getElementById("slideshowContainer");
        slideHeight = slide.offsetHeight;
        slideWidth = slide.offsetWidth;
        slideOffset = $( "#slideshowContainer").offset();
        document.getElementById("big-container").requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}


let webLeftOffset;
let webTopOffset;

document.onfullscreenchange = function ( event ) {
    if (isWebcamVisible) {
        let video = document.getElementById("container");
        webLeftOffset = video.offsetLeft;
        webTopOffset = video.offsetTop;
    }
}

document.addEventListener('fullscreenchange', (event) => {
    let video = document.getElementById("container");
    let slide = document.getElementById("slideshowContainer");
    let videoOffset;

    if (!document.fullscreenElement && isWebcamVisible) {
        videoOffset = $( "#container").offset();
        let slideOffset = $( "#slideshowContainer").offset();

        video.style.top = ((videoOffset.top / fullscreenHeight) * slide.offsetHeight + slideOffset.top - 1) + "px";
        video.style.left = ((videoOffset.left / fullscreenWidth) * slideWidth + slideOffset.left) + "px";

        if(video.offsetLeft + video.offsetWidth > fullscreenWidth) {
            video.style.left = fullscreenWidth - video.offsetWidth + "px";
        }

    } else if (document.fullscreenElement && isWebcamVisible) {
        videoOffset = $( "#container").offset();
        let videoTop = videoOffset.top;
        let videoLeft = videoOffset.left;
        video.style.top = ((videoTop / slideHeight) * fullscreenHeight - slideOffset.top - 56) + "px";
        video.style.left = ((videoLeft / slideWidth) * fullscreenWidth - slideOffset.left) + "px";

        let heightFactor = fullscreenHeight / slideHeight;

        video.style.height = heightFactor * (video.offsetHeight) - 40 + "px";

        let newWidth = (video.offsetHeight - 40) * 4 / 3;
        video.style.width = newWidth + "px";

        if(video.offsetLeft + video.offsetWidth > slideOffset.left + slideWidth) {
            video.style.left = slideOffset.left + slideWidth - newWidth - 10 + "px";
        }
    }
})
