/**
 * EZMail module
 * @author Alex Lazar
 * @extends Mandrill
 *
 * Implement the new sending by message as Object(from Mandrill) and sends it within a different Thread if async is set to 1/true
 *
 * Eg of use:
 *
 * var EZMail = require('decaf-email').EZMail,
 *     email = new EZMail({});
 *
 * email.send( {
 *           async: true, // will send the email in a separate thread
 *           from: {
 *               address: "no_reply@example.io",
 *               name: "Sender name"
 *              },
 *           to: {
 *               address: "receiever@example.com",
 *               name: "Receiver name"
 *           },
 *           subject: "My subject",
 *           text: "my text goes here"
 *  });
 * */

/* global require, decaf, EZMail */

var Thread = require('Threads').Thread,
    Mail   = require('Mandrill').Mandrill;

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