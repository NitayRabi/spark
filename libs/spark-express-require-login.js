const assert = require('assert');
const cookieParser = require('cookie-parser');
const _ = require('lodash');
const SparkSessionCrypto = require('./spark-session-crypto');
const key = require('../tests/libs/session-test-support').validKey;
const sparkSessionCrypto = new SparkSessionCrypto(key);
const SessionCookieName = require('./spark-express-session').SessionCookieName;
//var csrf = require('csurf');
//app.use(csrf());
//res.cookie('sessionid', '1', { httpOnly: true });
//res.cookie('sessionid', '1', { secure: true });

const forbid = (req, res, next) => {
    next(new Error('Session Required.'));
};

const redirect = resolveRedirectUrl => {
    return (req, res) => {
        return res.redirect(resolveRedirectUrl(req));
    }
};

const hasSession = session => session && session.email;

const requireLoginIfNoSession = (noLoginHandler) => {
    assert(noLoginHandler, 'No handler was provided');
    return (req, res, next) => hasSession(req.session) ? next() : noLoginHandler(req, res, next);
};

const registerSessionReader = app => {
    app.use(cookieParser());
    app.use((req, res, next) => {
        if (!_.isUndefined(req.cookies[SessionCookieName])) {
            try {
                req.sparkSession = sparkSessionCrypto.decrypt(req.cookies[SessionCookieName]);
            } catch (err) {
                console.log('validation failed');
                delete req.sparkSession;
            }
        }
        next();
    });
};

module.exports = {forbid, redirect, requireLoginIfNoSession, registerSessionReader};