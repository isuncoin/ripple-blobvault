var config = require('./config');
var http = require('http');
var https = require('https');
var fs = require('fs');
var express = require('express');
var store = require('./lib/store')(config.dbtype);
var hmac = require('./lib/hmac');
var ecdsa = require('./lib/ecdsa')(store);
var api = require('./api');
var reporter = require('./lib/reporter');
var guard = require('./guard')(store)
var limiter = guard.resend_email();
var blobIdentity = require('./lib/blobIdentity');
var Ddos= require('ddos');
var ddos = new Ddos({burst:10});

var health = require('./health')(store.db)
health.start()

api.setStore(store);
hmac.setStore(store);
blobIdentity.setStore(store);

var app = express();
app.use(ddos.express)
app.use(reporter.inspect);

// app.use(express.limit('1mb')); is deprecated and has no functionality
// now delegated to raw-body; has a default 1mb limit 

app.use(express.json());
app.use(express.urlencoded());

var cors = require('cors');
app.use(cors());

// JSON handlers
app.post('/v1/user', ecdsa.middleware, api.blob.create);
app.post('/v1/user/email', limiter.check, ecdsa.middleware, api.user.emailChange);
app.post('/v1/user/email/resend', limiter.check, api.user.emailResend);
app.post('/v1/user/:username/rename', ecdsa.middleware, api.user.rename);
app.post('/v1/user/:username/updatekeys', ecdsa.middleware, api.user.updatekeys);
app.get('/v1/user/recov/:username', ecdsa.recov, api.user.recov);
app.post('/v1/user/:username/profile', hmac.middleware, api.user.profile);

app.post('/v1/lookup', api.user.batchlookup)

app.delete('/v1/user/:username', ecdsa.middleware, api.blob.delete);
app.get('/v1/user/:username', api.user.get);
app.get('/v1/user/:username/verify/:token', api.user.verify);

// blob related
app.get('/v1/blob/:blob_id', api.blob.get);
app.post('/v1/blob/patch', hmac.middleware, api.blob.patch);
app.get('/v1/blob/:blob_id/patch/:patch_id', api.blob.getPatch);
app.post('/v1/blob/consolidate', hmac.middleware, api.blob.consolidate);

// old phone validation
app.post('/v1/user/:username/phone', api.user.phoneRequest)
app.post('/v1/user/:username/phone/validate', api.user.phoneValidate)

// 2FA
app.post('/v1/blob/:blob_id/2fa', ecdsa.middleware, api.user.set2fa)
app.get('/v1/blob/:blob_id/2fa', hmac.middleware, api.user.get2fa)
app.get('/v1/blob/:blob_id/2fa/requestToken', api.user.request2faToken)
app.post('/v1/blob/:blob_id/2fa/verifyToken', api.user.verify2faToken)

// attestation routes
app.post('/v1/attestation/phone', hmac.middleware, blobIdentity.getID, api.attestation.phone.get);
app.post('/v1/attestation/phone/update', hmac.middleware, blobIdentity.getID, api.attestation.phone.update);
app.post('/v1/attestation/profile', hmac.middleware, blobIdentity.getID, api.attestation.profile.get);
app.post('/v1/attestation/profile/update', hmac.middleware, blobIdentity.getID, api.attestation.profile.update);
app.post('/v1/attestation/identity', hmac.middleware, blobIdentity.getID, api.attestation.identity.get);
app.post('/v1/attestation/identity/update', hmac.middleware, blobIdentity.getID, api.attestation.identity.update);
//app.post('/v1/attestation/email', hmac.middleware, blobIdentity.getID, api.attestation.email.get);
//app.get('/v1/attestation/email/verify', api.attestation.email.verify);
app.get('/v1/attestation/summary', hmac.middleware, blobIdentity.getID, api.attestation.summary.get);

//signing certificate endpoints
app.get('/v1/oauth2/cert', api.keys.public);
app.get('/v1/oauth2/jwks', api.keys.jwks);

app.get('/v1/authinfo', api.user.authinfo);
app.get('/health', health.status);
app.get('/logs', api.blob.logs);

app.get('/', function (req, res) {
  res.send('');
});

try {
  var server = config.ssl ? https.createServer({
    key: fs.readFileSync(__dirname + '/blobvault.key'),
    ca: fs.readFileSync(__dirname + '/intermediate.crt'),
    cert: fs.readFileSync(__dirname + '/blobvault.crt')
  }, app) : http.createServer(app);
  var port = config.port || (config.ssl ? 443 : 8080);
  server.listen(port, config.host);
  reporter.log("Blobvault listening on port "+port);
} catch (e) {
  reporter.log("Could not launch SSL server: " + (e.stack ? e.stack : e.toString()));
}

process.on('SIGTERM',function() {
    reporter.log("caught sigterm");
    process.exit();
});
process.on('SIGINT',function() {
    reporter.log("caught sigint");
    process.exit();
});
process.on('exit',function() {
    reporter.log("Shutting down.");
//    emailCampaign.stop();
    if (store.db && store.db.client)
        store.db.client.pool.destroy();
    reporter.log("Done");
});
