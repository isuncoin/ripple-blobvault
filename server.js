var config = require('./config');
var http = require('http');
var https = require('https');
var fs = require('fs');
var express = require('express');
var morgan = require('morgan');
var store = require('./lib/store')(config.dbtype);
var hmac = require('./lib/hmac');
var ecdsa = require('./lib/ecdsa')(store);
var api = require('./api');
var guard = require('./guard')(store)
var limiter = guard.resend_email();
var blobIdentity = require('./lib/blobIdentity');
var log = require('./lib/log.js').winston;

var health = require('./health')(store.db)
health.start()

console.log(ecdsa);

api.setStore(store);
hmac.setStore(store);
blobIdentity.setStore(store);

var app = express();
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {stream: log.winstonStream}));

app.use(express.json());
app.use(express.urlencoded());

var cors = require('cors');
app.use(cors());

// JSON handlers
app.post('/v1/user', ecdsa.create, api.blob.create);
app.post('/v1/user/email', limiter.check, ecdsa.middleware, api.user.emailResend);
app.post('/v1/user/:username/rename', ecdsa.middleware, api.user.rename);
app.post('/v1/user/:username/updatekeys', ecdsa.middleware, api.user.updatekeys);
app.get('/v1/user/recov/:username', ecdsa.recover, api.user.recover);//DEPRECIATE THIS
app.get('/v1/user/recover/:username', ecdsa.recover, api.user.recover);
app.post('/v1/user/:username/profile', hmac.middleware, api.user.profile);
app.post('/v1/user/:username/notify_2fa_change',         api.user.notify_2fa_change);
app.post('/v1/user/:username/notify_verify_ok',          api.user.notify_verify_ok);
app.post('/v1/user/:username/notify_verify_fail',        api.user.notify_verify_fail);
app.post('/v1/user/:username/notify_verify_pending',     api.user.notify_verify_pending);
app.post('/v1/user/:username/notify_step_null',          api.user.notify_step_null);
app.post('/v1/user/:username/notify_step_jumio_id',      api.user.notify_step_jumio_id);
app.post('/v1/user/:username/notify_step_jumio_doc',     api.user.notify_step_jumio_doc);
app.post('/v1/user/:username/notify_step_jumio_company', api.user.notify_step_jumio_company);
app.post('/v1/user/:username/notify_step_jumio_id2',     api.user.notify_step_jumio_id2);
app.post('/v1/user/:username/notify_step_jumio_com_id', api.user.notify_step_jumio_com_id);

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
    key: fs.readFileSync(__dirname + '/authd.isuncoins.com.key'),
    cert: fs.readFileSync(__dirname + '/authd.isuncoins.com.crt')
  }, app) : http.createServer(app);
  var port = config.port || (config.ssl ? 443 : 8080);
  server.listen(port, config.host);
  log.info("Blobvault listening on port "+port);
} catch (e) {
  log.info("Could not launch SSL server: " + (e.stack ? e.stack : e.toString()));
}

process.on('SIGTERM',function() {
  log.warn("caught sigterm");
  process.exit();
});
process.on('SIGINT',function() {
  log.warn("caught sigint");
  process.exit();
});
process.on('exit',function() {
  log.info("Shutting down.");
//    emailCampaign.stop();
  if (store.db && store.db.client) {
    store.db.client.pool.destroy();
  }
  log.info("Done");
});
