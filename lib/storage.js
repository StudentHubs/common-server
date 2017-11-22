"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const crypto = require("crypto");
const uuid = require("uuid");
const common_1 = require("common");
const sign = (content, key) => {
    const cryptoSign = crypto.createSign('RSA-SHA256');
    cryptoSign.update(content);
    return cryptoSign.sign(key, 'base64');
};
function storage(domain, googleKey) {
    const router = new Router();
    router.get('/file/:bucketId/:fileId', ctx => {
        const expiration = Math.round(Date.now() / 1000) + 60;
        const storageId = `${ctx.params.bucketId}/${ctx.params.fileId}`;
        const signature = sign(`GET\n\n\n${expiration}\n/${storageId}`, googleKey.private_key);
        ctx.redirect(`https://storage.googleapis.com/${storageId}?GoogleAccessId=${googleKey.client_email}` + `&Expires=${expiration}&Signature=${encodeURIComponent(signature)}`);
    });
    router.post('/upload', ctx => {
        const { uploadIndex, bucketId, maxSize } = ctx.request.body;
        const successUrl = `${domain}/storage/upload/${uploadIndex}`;
        const policyDoc = {
            expiration: new Date(Date.now() + 10 * 60000).toISOString(),
            conditions: [
                ['starts-with', '$content-disposition', ''],
                ['starts-with', '$key', ''],
                { bucket: bucketId },
                { success_action_redirect: successUrl },
                ['content-length-range', 0, maxSize],
            ],
        };
        const policy = new Buffer(JSON.stringify(policyDoc)).toString('base64');
        ctx.body = {
            uploadId: common_1.encodeId(uuid()),
            policy,
            signature: sign(policy, googleKey.private_key),
        };
    });
    router.get('/upload/:uploadIndex', ctx => {
        ctx.body = `
    <script type="text/javascript">
      window.parent.postMessage(${ctx.params.uploadIndex}, '*');
    </script>
    `;
    });
    return router;
}
exports.default = storage;
