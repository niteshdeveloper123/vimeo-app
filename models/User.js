var mongoose = require('mongoose');

var userschema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

var User = module.exports = mongoose.model('users', userschema);

module.exports.get = function (callback, limit) {
    User.find(callback).limit(limit);
}