/**
 * Created by alexandrulazar on 2/23/15.
 *
 */
/* global require, decaf, EZMail */
var Thread = require('Threads').Thread,
    Mail = require('Mandrill').Mandrill;

var EZMail = function( config ) {
   this.mail = new Mail(config);

};

decaf.extend(EZMail.prototype, {
    /**
     * Sends message sync and async depending on flag
     * @param {Object} message
     * */
    send: function(message) {
        var mail = this.mail,
            thr;
        if (message.async) {
            thr =  new Thread(mail.send.bind(mail,message));
            thr.start();
        } else {
            mail.send(message);
        }
    }
});

decaf.extend(exports, {
    EZMail: EZMail
});