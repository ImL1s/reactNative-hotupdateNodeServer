// flow
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.handle = handle;

var _rxjs = require('rxjs');

var _operators = require('rxjs/operators');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
function handle(req, resp) {
    (0, _rxjs.of)(1).pipe((0, _operators.concatMap)(function () {
        fs.readFile('./public/bundle/config.json', { encoding: 'utf8' }, function (err, data) {
            if (err) {
                console.log(err);
                resp.send((0, _stringify2.default)(err));
                return;
            }
            var configJSON = JSON.parse(data);
            resp.json((0, _stringify2.default)(configJSON));
        });
    })).subscribe();
}

// module.exports = { handle };
//# sourceMappingURL=UpdateHandler.js.map