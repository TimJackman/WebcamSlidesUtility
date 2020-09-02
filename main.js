let isWebcamVisible = false;
let isToggling = false;
let hasToggledWebcam = false;
let fullscreenHeight = window.screen.height;
let fullscreenWidth = window.screen.width;
let slideHeight;
let slideWidth;
let slideOffset;
let hasWebcam = false;
let hasPermission = false;
let webcamNames = [];
let webcamIds = []

async function getWebcamPermissions() {
    let stream = null;
    let hasDenied = false;

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true})
        hasPermission = true;
        await enumerateWebcams();
        let tracks = stream.getTracks();

        for (let i = 0; i < tracks.length; i++) {
            let track = tracks[i];
            track.stop();
        }

    } catch(err) {
        if (err.name === "NotAllowedError") {
            alert('This application requires Webcam access to work. Please refresh and give permission.');
            hasDenied = true;
        } else {
            hasPermission = true;
        }
    }

    if (!hasPermission && !hasDenied) {
        alert('This application requires Webcam access to work. Please refresh and give permission.');
    }
}

async function enumerateWebcams() {
    await navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            let webcamNameOccurences = {};
            devices.forEach(function(device) {
                if (device.kind === "videoinput") {
                    console.log(device.label);
                    if (device.label != "") {
                        if (device.label in webcamNameOccurences) {
                            let occurences = webcamNameOccurences[device.label]
                            webcamNames.push(device.label + " #" + (occurences + 1));
                            webcamNameOccurences[device.label] = occurences + 1;
                        } else {
                            webcamNames.push(device.label);
                            webcamNameOccurences[device.label] = 1;
                        }
                    } else {
                        webcamNames.push("Webcam #" + (webcamNames.length + 1));
                    }

                    webcamIds.push(device.deviceId);
                }
            });
        })
        .catch(function (err) {
            console.log(err.name + ": " + err.message);
        });

    let select = document.getElementById("webcams");
    webcamNames.forEach(function (webcam) {
        console.log("adding Option!");
        let option = document.createElement("option");
        option.text = webcam;
        select.add(option);
    });

    console.log("selecting: " + webcamNames[0]);
    select.value = webcamNames[0];
    $( "#webcams" ).selectmenu("refresh");
}

function loadURL() {
    let slides = document.getElementById('slideshow');
    let url = document.getElementById('url').value;

    if (url.includes("pub?start=")) {
        let endPos = url.indexOf("pub?start=")
        url = url.substring(0, endPos) + 'embed';
    } else if (url.includes("<iframe src=")) {
        url = url.slice(url.indexOf("\"" + 1), url.indexOf("?start" -1));
    } else if (url.includes("edit")) {
        let endPos = url.indexOf("edit")
        url = url.substring(0,endPos) + 'embed';
    }

    slides.src = url;
}

function toggleContainer(){
    if (!hasToggledWebcam) {
        let container = document.getElementById('container');
        let slideContainer = $( "#slideshowContainer").offset();
        container.style.left = slideContainer.left;
        container.style.top = slideContainer.top;
        container.style.zIndex = "100";
        hasToggledWebcam = !hasToggledWebcam;
    }
    $( "#container" ).toggle("clip",500);
}

async function toggleWebcam(){
    let video = document.getElementById("videoElement");
    if (!isWebcamVisible && navigator.mediaDevices.getUserMedia) {
        let selectedWebcam = document.getElementById("webcams").value;
        let selectedID = webcamIds[webcamNames.indexOf(selectedWebcam)];
        await navigator.mediaDevices.getUserMedia({
            video: {
                deviceId: {exact: selectedID}}})
            .then(function (stream) {
                video.srcObject = stream;
                hasWebcam = true;
                isWebcamVisible = true;

            }).catch(function (err0r) {
                alert("This webcam is unavailable. Please make sure it is not in use by another program, such as Zoom.");
        })
    } else if (isWebcamVisible) {

        let stream = document.getElementById("videoElement").srcObject;
        let tracks = stream.getTracks();

        for (let i = 0; i < tracks.length; i++) {
            let track = tracks[i];
            track.stop();
        }
        document.getElementById("videoElement").srcObject = null
        hasWebcam = false;
        isWebcamVisible = false;
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
        if (!hasPermission) {
            alert('This application requires Webcam access to work. Please refresh and give permission.');
            return;
        }

        if (!isToggling) {
            isToggling = true;
            let spin = $( "#spin" );
            spin.show();
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
            spin.hide();
        }
    });
    let container = $( "#container" );
    container.resizable({
        aspectRatio:  4 / 3,
        handles: 'ne, se, sw, nw'
    });
    container.draggable({
        containment: "parent",
        iframeFix: true
    });

    let select = $( "#webcams" )
    select.selectmenu({
        width: 300
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
        /*let container = document.getElementById('slideshowContainer');*/
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
