/* UNITS ARE METERS!! */

var scene, controls, tracking, camera,
    glRenderer, clock,
    geometry, material, glBarrelDistortion;

var vr;

var distortionOptions = {
    HMD: {
        hResolution: 1920,
        vResolution: 1080,
        hScreenSize: 0.1262,
        vScreenSize: 0.071,
        interpupillaryDistance: 0.064,
        lensSeparationDistance: 0.064,
        eyeToScreenDistance: 0.041,
        distortionK : [1.0, 0.22, 0, 0.0],
        chromaAbParameter: [ 0.996, -0.004, 1.014, 0.0],
        worldFactor: 1
    }
};
var ready = $.Deferred();

$(function () {
    try {
        $.when(hmd.get()).then(function(hmd) {
            vr = hmd.hardwareUnitId != "debug-0";
            go();
        }).fail(function() {
            vr = false;
            go();
        });
    } catch(e) {
        vr = false;
        go();
    }

    function go() {
        pointerLock();
        init();
        animate();
    }
});

function init() {
    clock = new THREE.Clock();

    glRenderer = makeWebGlRenderer();
    glRenderer.setClearColor(0xffffff, 1);

    document.body.appendChild(glRenderer.domElement);

    scene = new THREE.Scene();

    //scene.add(makeFloor());

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1 / 100, 10000 );
    camera.position.y = 0;

    tracking = new THREE.OculusNativeControls( camera );
    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );

    glBarrelDistortion = new THREE.OculusRiftEffect( glRenderer, distortionOptions );
    glBarrelDistortion.setSize( window.innerWidth, window.innerHeight );

    var aspectRatio = 4 / 3;
    var panelWidth = 4;
    var panelHeight = panelWidth / aspectRatio;

    var urls = ['http://i.imgur.com/8FMgdWQ.jpg', 'http://i.imgur.com/img0gF3.jpg', 'http://i.imgur.com/t7wX6Cx.jpg'];

    var numPanels = 8;
    var radius = 5;
    THREE.ImageUtils.crossOrigin = '';

    for (var i = 0; i < numPanels; i++) {
        var img = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(urls[i % urls.length])
        });

        var panel = new THREE.Mesh(new THREE.PlaneGeometry(panelWidth, panelHeight), img);
        scene.add(panel);

        var angle = i / numPanels * Math.PI * 2;
        panel.position.x = radius * Math.cos(angle);
        panel.position.z = radius * Math.sin(angle);
        panel.position.y = 2;

        panel.rotation.y = 3 * Math.PI / 2 - angle;
    }
}

function makeWebGlRenderer() {
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}

function makeFloor() {

    var size = 500;
    var edgeWidth = 1 / 10;

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({ color: 'lightgrey' });

    for (var x = -size; x <= size; x += edgeWidth) {
        geometry.vertices.push(new THREE.Vector3(-size, -0.04, x));
        geometry.vertices.push(new THREE.Vector3(size, -0.04, x));
        geometry.vertices.push(new THREE.Vector3(x, -0.04, -size));
        geometry.vertices.push(new THREE.Vector3(x, -0.04, size));
    }

    return new THREE.Line(geometry, material, THREE.LinePieces);
}

function animate() {

    requestAnimationFrame(animate);

    tracking.update( clock.getDelta() );
    controls.update( clock.getDelta() );

    if(vr) {
        glBarrelDistortion.render(scene, camera);
    } else {
        glRenderer.render(scene, camera);
    }
}


function pointerLock() {
    var blocker = document.getElementById( 'blocker' );
    var instructions = document.getElementById( 'instructions' );

    // http://www.html5rocks.com/en/tutorials/pointerlock/intro/

    var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

    if ( havePointerLock ) {

        var element = document.body;

        var pointerlockchange = function ( event ) {

            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

                controls.enabled = true;

                blocker.style.display = 'none';

            } else {

                controls.enabled = false;

                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';

                instructions.style.display = '';

            }

        }

        var pointerlockerror = function ( event ) {

            instructions.style.display = '';

        }

        // Hook pointer lock state change events
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        document.addEventListener( 'keydown', function ( event ) {
            if(!event.keyCode === 13/*Enter*/) {
                return;
            }

            instructions.style.display = 'none';

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

            if ( /Firefox/i.test( navigator.userAgent ) ) {

                var fullscreenchange = function ( event ) {

                    if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                        document.removeEventListener( 'fullscreenchange', fullscreenchange );
                        document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                        element.requestPointerLock();
                    }

                }

                document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                element.requestFullscreen();

            } else {

                element.requestPointerLock();

            }

        }, false );

    } else {

        instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

    }
}