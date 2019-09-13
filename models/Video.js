var mongoose = require('mongoose');

var videoschema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videourl: {
        type: String,
        required: true
    },
    videopassword: {
        type: String,
        required: true
    }
});

var Video = module.exports = mongoose.model('video-link-password', videoschema);

module.exports.get = function (callback, limit) {
    Video.find(callback).limit(limit);
}