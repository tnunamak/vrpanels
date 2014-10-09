/**
 * @author tnunamak
 */

THREE.OculusNativeControls = function ( object ) {
    var self = this;
    this.object = object;
    this.target = new THREE.Vector3( 0, 0, 0 );

    this.ready = false;

    if(typeof navigator.getVRDevices === "undefined") {
        throw Error('Please use a VR supported browser');
    }
    console.log(navigator.getVRDevices);
    navigator.getVRDevices().then(setHmd);

    var vrHMD, vrSensor;
    function setHmd(vrdevs) {
        // First, find a HMD -- just use the first one we find
        for (var i = 0; i < vrdevs.length; ++i) {
            if (vrdevs[i] instanceof HMDVRDevice) {
                vrHMD = vrdevs[i];
                break;
            }
        }

        if (!vrHMD){
            throw Error('No HMD found');
        }

        // Then, find that HMD's position sensor
        for (var i = 0; i < vrdevs.length; ++i) {
            if (vrdevs[i] instanceof PositionSensorVRDevice &&
                vrdevs[i].hardwareUnitId == vrHMD.hardwareUnitId)
            {
                vrSensor = vrdevs[i];
                break;
            }
        }

        if (!vrHMD || !vrSensor) {
            alert("Didn't find a HMD and sensor!");
        }

        self.ready = true;
    }

    this.update = function() {
        if ( !this.ready ) {
            return;
        }
        var state = vrSensor.getState();

        if (state.orientation) {
            this.object.quaternion.set(state.orientation.x, state.orientation.y, state.orientation.z, state.orientation.w);
        }
        if (state.position) {
            this.object.position.set(state.position.x, 2 + state.position.y, state.position.z);
        }
    };

};