hmd = {

    get: function() {
        if(typeof navigator.getVRDevices === "undefined") {
            throw Error('Please use a VR supported browser');
        }

        var getHmd = $.Deferred();

        navigator.getVRDevices().then(_.bind(_.partial(this.resolve, getHmd), this));

        return getHmd;
    },

    resolve: function(getHmd, vrdevs) {
        var self = this;

        this.hmd = _.find(vrdevs, function(dev) {
            return dev instanceof HMDVRDevice;
        });

        if (!this.hmd) {
            getHmd.reject('No HMD found');
            return;
        }

        this.sensor = _.find(vrdevs, function(dev) {
            return dev instanceof PositionSensorVRDevice && dev.hardwareUnitId === self.hmd.hardwareUnitId;
        });

        if (!this.hmd || !this.sensor) {
            getHmd.reject('No HMD found');
            return;
        }

        getHmd.resolve(this.hmd, this.sensor);
    }
};