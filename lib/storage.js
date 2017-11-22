"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Router = require("koa-router");
var crypto = require("crypto");
var uuid = require("uuid");
var common_1 = require("common");
var sign = function (content, key) {
    var cryptoSign = crypto.createSign('RSA-SHA256');
    cryptoSign.update(content);
    return cryptoSign.sign(key, 'base64');
};
function storage(domain, googleKey) {
    var router = new Router();
    router.get('/file/:bucketId/:fileId', function (ctx) {
        var expiration = Math.round(Date.now() / 1000) + 60;
        var storageId = ctx.params.bucketId + "/" + ctx.params.fileId;
        var signature = sign("GET\n\n\n" + expiration + "\n/" + storageId, googleKey.private_key);
        ctx.redirect("https://storage.googleapis.com/" + storageId + "?GoogleAccessId=" + googleKey.client_email + ("&Expires=" + expiration + "&Signature=" + encodeURIComponent(signature)));
    });
    router.post('/upload', function (ctx) {
        var _a = ctx.request.body, uploadIndex = _a.uploadIndex, bucketId = _a.bucketId, maxSize = _a.maxSize;
        var successUrl = domain + "/storage/upload/" + uploadIndex;
        var policyDoc = {
            expiration: new Date(Date.now() + 10 * 60000).toISOString(),
            conditions: [
                ['starts-with', '$content-disposition', ''],
                ['starts-with', '$key', ''],
                { bucket: bucketId },
                { success_action_redirect: successUrl },
                ['content-length-range', 0, maxSize],
            ],
        };
        var policy = new Buffer(JSON.stringify(policyDoc)).toString('base64');
        ctx.body = {
            uploadId: common_1.encodeId(uuid()),
            policy: policy,
            signature: sign(policy, googleKey.private_key),
        };
    });
    router.get('/upload/:uploadIndex', function (ctx) {
        ctx.body = "\n    <script type=\"text/javascript\">\n      window.parent.postMessage(" + ctx.params.uploadIndex + ", '*');\n    </script>\n    ";
    });
    return router;
}
exports.default = storage;
