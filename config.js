// IP of the interface to bind to, default (null) means to bind to any
// exports.host = '127.0.0.1';
exports.host = null;

exports.blockscore = {
    key: ''
}

// Port to listen on
exports.port = 27182;

// Public URL for this blobvault (required for authinfo)
exports.url = "https://authd.isuncoins.com:27182";

// SSL settings
exports.ssl = true;

// Whether this blob vault is running behind a reverse proxy
exports.is_proxy = false;

// The disk quota per user in kilobytes
// 1mb = 1024kb = 1024 bytes / kb * 1024 kb / mb = 1048576 bytes / mb
exports.quota = 1024;

// The maximum patch size in kilobytes
exports.patchsize = 1;

// if testmode = true, there is no remote rippled connection made
// and no ecdsa signature check on create
exports.testmode = false

// if account is created before this date and funded
exports.nolimit_date = 'Thu May 1 2016';

// maximum length of a ripple username
exports.username_length = 20;

// time of day that emails are sent out to warn unfunded users they may lose their name
// 24 hour time, midnight = 0
// set for 8 AM
exports.schedule = {
    hour: 8,
    minute:0
}

// if you want to mark emails as being originated from a staging environment
exports.is_staging = false;

// authy phone verification
exports.phone = {
    url : 'http://sandbox-api.authy.com',
    key : '591b17780a53fb9872ec1f17f49e4fff'
}

//blockscore identity verification
exports.blockscore = {
    key : ''
}

//signed JWT iss
exports.issuer = "https://id.ripple.com";

// run campaign logic
// should be true from only one instance
exports.campaigns = false;


// Database settings
// 'mysql', 'memory', 'postgres'
exports.dbtype = 'postgres';
//exports.dbtype = 'mysql';
//exports.dbtype = 'memory';
exports.database = {
    mysql : {
        host     : '127.0.0.1',
        user     : '',
        password : '',
        database : 'blobvault',
        charset  : 'utf8'
    },
    postgres : {
        host     : '127.0.0.1',
        user     : 'postgres',
        password : 'password',
        database : 'blobvault',
        charset  : 'utf8'
    }
}

exports.email = {
    user: "admin@isuntv.com",
    password: "sfxtzqmmqexflppe",
    host:  "smtp.gmail.com",
    from: "admin@isuntv.com",
}

exports.ripplelib = {
  trusted:        true,
  servers: [
    {
        host:    '192.168.100.175'
      , port:    19528
      , secure: true 
    }
  ]
}

// PAKDF server setting
exports.defaultPakdfSetting = {
  "host": "authd.isuncoins.com",
  "url": "https://authd.isuncoins.com:27183/api/sign",
  "exponent": "010001",
  "alpha": "acb6918e33ac96d15f4c2a8e95016eec01fd852d5e1491239e4448d7d9645569394e352966f3a7e3ee9ee880f23272007d63a89688fb86db0b6961e00515145864366d0021c08b313c733d31dad63da96070a87bbeac48be4cc8ca6e597c164e912fd6c4ac411c823420d33b43604b30564f75b5d4583f0e90ea5d3db20bc4b08be64b1d496fe6699b6f58320b1aaa6e94f56d0161564e8abf860527dde6634900135f1c67f26aee3f66425d9f7084d260d389a11bd2c731dcdb2a2d16cfc53babec72f5751463befc6ea62276dece1003616fd6a821e7610b3d888a27bdd906e992d70c9ea123786ea3759b21f4fdda6e178d4389e4cd05e5ca816503d5b8c2",
  "modulus": "bb9fcccb1e53d3b8bdee087b1878669f5f475fa99e934c114bcfc4fbe150e65d377182fe3e5944d349e407534a7126a2298a3e406ba8597fc8b5566066aa0c2a4ec60ee49964e40c8d6ad2358ddbb18a66e24ca6eff34f0e0def1a9013e78ddb90ba05de34d5eb9f64ad4392cd0eb16b8566ccd1c94e2d26d9636ab9babc9be02c5540d766e7449f629a2e6264eae2f5c96670c7b11aaa08deabf4b7164270632c86f48c7860dd1545dfbfa78620fbf0241fc327f00ac0d868fb0d6a8d5ab6b981c2da4b959c12c608af03fe3abe552f8dc5fa37adcfba3809470a3df02e2dcdf2273c96a429ffe6197b968586b83dd83f04d00c46d4467845807f966fb50c01"
};

exports.AUTHINFO_VERSION = 3;

// Reserved usernames
//
// Format:
//   exports.reserved = {
//     "google":"google.com"
//   }
//
// Becomes:
// "Sorry, the name "google" is reserved for the owner of "google.com" [Claim]"
//
// You can import the list externally:
//   exports.reserved = require('./names.json');
exports.reserved = {};

// If this blobvault is behind a reverse proxy, enter the url prefix that proxy
// is using.
//
// E.g. if the rediret is this:
// https://example.com/ripple-blobvault -> http://localhost:8080/
// Then this option should be set to this:
// exports.urlPrefix = '/ripple-blobvault';
exports.urlPrefix = '';

exports.newrelic = 'YOUR KEY';

// Skip 2FA check.
// exports.skip_2fa = true

