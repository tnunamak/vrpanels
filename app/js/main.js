var glScene, cssScene, controls, camera, glRenderer, cssRenderer,
    geometry, material, sphere;

$(function () {
    init();
    animate();
});

function init() {
    glRenderer = makeWebGlRenderer();
    cssRenderer = makeCssRenderer();

    document.body.appendChild(glRenderer.domElement);
    document.body.appendChild(cssRenderer.domElement);

    glScene = new THREE.Scene();
    cssScene = new THREE.Scene();

    glScene.add(makeFloor());

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight);

    camera.position.y = window.innerHeight / 2;
    camera.position.z = 1500;


    controls = new THREE.OrbitControls(camera);

    // create the plane mesh
    var material = new THREE.MeshBasicMaterial({ wireframe: true, color: 'blue' });
    material.color.set('black');
    material.opacity = 0;
    material.blending = THREE.NoBlending;

    // TODO these dimensions might not be right
    var geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 10, 10);

    var numFebs = 5;
    var radius = 1500;

    for (var i = 0; i < numFebs; i++) {
        var planeMesh = new THREE.Mesh(geometry, material);
        glScene.add(planeMesh);

        /*if(i===0){
            camera.lookAt(planeMesh.position);
        }*/

        var angle = i / numFebs * Math.PI * 2;
        planeMesh.position.x = radius * Math.cos(angle);
        planeMesh.position.z = radius * Math.sin(angle);
        planeMesh.position.y = window.innerHeight / 2;

        planeMesh.rotation.y = 3 * Math.PI / 2 - angle;

        var url = 'http://en.wikipedia.org/wiki/Portal:Current_events/' + (2014 - i) + '_February_12';

        var iframe = $('<iframe src="' + url + '" />').css({width: window.innerWidth, height: window.innerHeight});

        // create the object3d for this element
        var cssObject = new THREE.CSS3DObject(iframe[0]);

        cssObject.position.x = planeMesh.position.x;
        cssObject.position.y = planeMesh.position.y;
        cssObject.position.z = planeMesh.position.z;

        cssObject.rotation.x = planeMesh.rotation.x;
        cssObject.rotation.y = planeMesh.rotation.y;
        cssObject.rotation.z = planeMesh.rotation.z;

        // add it to the css scene
        cssScene.add(cssObject);
    }
}

function makeCssRenderer() {
    var cssRenderer = new THREE.CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;
    return cssRenderer;
}

function makeWebGlRenderer() {
    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    return renderer;
}

function makeFloor() {

    var size = 5000;
    var edgeWidth = 100;

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

    //planeMesh.rotation.x += 0.01;
    //cssObject.rotation.x += 0.01;

    if (Math.random() > 0.99) {
        //console.log(camera);
    }

    glRenderer.render(glScene, camera);
    cssRenderer.render(cssScene, camera);

    controls.update();
}