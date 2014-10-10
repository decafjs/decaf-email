/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/23/13
 * Time: 11:06 AM
 * To change this template use File | Settings | File Templates.
 */

/*global java, javax, Packages */

"use strict";

/**
 * @private
 */
var System = java.lang.System,
    Properties = java.util.Properties,
    Session = Packages.javax.mail.Session,
    Message = javax.mail.Message,
    {FileDataSource,DataHandler} = javax.activation,
    {InternetAddress, MimeBodyPart, MimeMessage, MimeUtility, MimeMultipart} = javax.mail.internet;

/**
 * Construct a new mail message
 *
 * The config object contains (optionally):
 *
 * - host: name of smtp host to use (defaults to localhost)
 * - port: port on smtp host to use (defaults to 25)
 * - tls: true/false enable/disable TLS
 * - charset: charset to use (defaults to system default or iso-8859-15
 * - username: username for authentication
 * - password: password for authentication
 *
 * For authentication, both config.username and config.password must be supplied.  Otherwise, no authentication will be tried.
 *
 * @param {object} config
 * @constructor
 */
function Mail(config) {
    config = config || {};
    config.host = config.host || 'localhost';
    this.config = config;
    var props = this.properties = new Properties();
    props.put('mail.transport.protocol', 'smtp');
    props.put('mail.smtp.host', String(config.host || 'localhost'));
    props.put('mail.smtp.port', String(config.port || 25));
    props.put('mail.smtp.starttls.enable', config.tls || 'false');
    props.put('mail.mime.charset', config.charset || System.getProperty('mail.charset') || 'iso-8859-15');
    if (config.username && config.password) {
        props.put('mail.smtp.auth', 'true');
    }
    this.session = Session.getInstance(props);
    this.message = new MimeMessage(this.session);
    this.buffer = null;
    this.multipartType = 'mixed';
    this.multipart = null;
}

decaf.extend(Mail.prototype, {
    /**
     * Set the sender of the message.
     *
     * @param {string} address sender's email address
     * @param {string} name optional sender's name
     * @chainable
     */
    setFrom: function(address, name) {
        if (address.indexOf('@') === -1) {
            throw new Error('Invalid address');
        }
        this.message.setFrom(name ? new InternetAddress(address, MimeUtility.encodeWord(name.toString())) : new InternetAddress(address));
        return this;
    },

    /**
     * Add an email recipient.
     *
     * @param {string} address email address to add
     * @param {string} name of person to add (optional)
     * @param {string} type - one of 'TO,' 'CC', 'BCC'
     * @chainable
     */
    addRecipient: function(address, name, type) {
        if (address.indexOf('@') === -1) {
            throw new Error('Invalid address');
        }
        var addr = name ? new InternetAddress(address, MimeUtility.encodeWord(name.toString())) : new InternetAddress(address);
        this.message.addRecipient(type, addr);
        return this;
    },

    /**
     * Set TO recipient to the message
     *
     * @param {string} address email address
     * @param {string} name optional person's name
     * @chainable
     */
    setTo: function(address, name) {
        if (address.indexOf('@') === -1) {
            throw new Error('Invalid address');
        }
        var addr = name ? new InternetAddress(address, MimeUtility.encodeWord(name.toString())) : new InternetAddress(address);
        this.message.setRecipient(Message.RecipientType.TO, addr);
        return this;
    },

    /**
     * Add a TO recipient to the message
     *
     * @param {string} address email address
     * @param {string} name optional person's name
     * @chainable
     */
    addTo: function(address, name) {
        if (address.indexOf('@') === -1) {
            throw new Error('Invalid address');
        }
        var addr = name ? new InternetAddress(address, MimeUtility.encodeWord(name.toString())) : new InternetAddress(address);
        this.message.addRecipient(Message.RecipientType.TO, addr);
        return this;
    },

    /**
     * Add a CC recipient to the message
     *
     * @param {string} address email address
     * @param {string} name optional person's name
     * @chainable
     */
    addCc: function(address, name) {
        if (address.indexOf('@') === -1) {
            throw new Error('Invalid address');
        }
        var addr = name ? new InternetAddress(address, MimeUtility.encodeWord(name.toString())) : new InternetAddress(address);
        this.message.addRecipient(Message.RecipientType.CC, addr);
        return this;
    },

    /**
     * Add a BCC recipient to the message
     *
     * @param {string} address email address
     * @param {string} name optional person's name
     * @chainable
     */
    addBcc: function(address, name) {
        if (address.indexOf('@') === -1) {
            throw new Error('Invalid address');
        }
        var addr = name ? new InternetAddress(address, MimeUtility.encodeWord(name.toString())) : new InternetAddress(address);
        this.message.addRecipient(Message.RecipientType.BCC, addr);
        return this;
    },

    /**
     * Set debug mode on or off
     *
     * @param {boolean} debug truf to enable debug mode
     * @chainable
     */
    setDebug: function(debug) {
        this.session.setDebug(debug === true);
        return this;
    },

    /**
     * Add a header to the message.
     *
     * @param {string} name - header name
     * @param {string} value - value to set
     * @chainable
     */
    addHeader: function(name, value) {
        this.message.addHeader(name, MimeUtility.encodeText(value));
        return this;
    },

    /**
     * Set a header in the message.
     *
     * If the header exists, it is replaced with the new value.
     *
     * @param {string} name - header name
     * @param {string} value - value to set
     * @chainable
     */
    setHeader: function(name, value) {
        this.message.setHeader(name, MimeUtility.encodeText(value));
        return this;
    },

    /**
     * Get values for a header name
     *
     * @param {string} name name of header
     * @returns {array} array of strings
     */
    getHeader: function(name) {
        var value = message.getHeader(name),
            len = value ? value.length : 0;
        if (len) {
            for (var i= 0; i<len; i++) {
                value[i] = String(MimeUtility.decodeText(value[i]));
            }
        }
        return value;
    },

    /**
     * Set the Reply-To address of the message.
     *
     * @param {string} address email address to reply to
     * @chainable
     */
    setReplyTo: function(address) {
        if (address.indexOf('@') === -1) {
            throw new Error('Invalid address');
        }
        this.message.setReplyTo([new InternetAddress(address)]);
        return this;
    },

    /**
     * Set the subject of the message
     *
     * @param {string} subject subject of message
     * @chainable
     */
    setSubject: function(subject) {
        if (!subject) {
            return this;
        }
        this.message.setSubject(MimeUtility.encodeWord(subject.toString()));
        return this;
    },

    /**
     * Set the body text of the message
     *
     * @param {string} text body text to set in the message
     * @chainable
     */
    setText: function(text) {
        if (text) {
            this.buffer = new java.lang.StringBuffer(text);
        }
        return this;
    },

    /**
     * Append text to the body text in the message.
     *
     * @param {string} text the text to append to the message body
     * @chainable
     */
    addText: function(text) {
        if (text) {
            if (this.buffer) {
                this.buffer = new java.lang.StringBuffer(text);
            }
            else {
                this.buffer.append(text);
            }
        }
        return this;
    },

    /**
     * Set the MIME multipart message subtype.
     *
     * The default value is 'mixed' for messages of type multipart/mixed.
     *
     * A common value is 'alternative' for multipart/alternative.
     *
     * @param {string} messageType the MIME subtype (e.g. 'mixed', 'alternative')
     * @chainable
     */
    setMultipartType: function(messageType) {
        this.multipartType = messageType;
        return this;
    },

    /**
     * Add attachment to the message.
     *
     * Multiple attachments may be added.
     *
     * @param {File|string} content a File object representing the attachment, or a string to be attached.
     * @param {string} filename - optional filename of the attachment
     * @param {string} contentType - optional attachment's mime type.
     * @chainable
     */
    addAttachment: function(content, filename, contentType) {
        this.multipart = this.multipart || new MimeMultipart(contentType);
        var part = new MimeBodyPart();
        if (typeof content === 'string') {
            part.setContent(content.toString(), contentType || 'text/plain');
            if (filename) {
                part.setFileName(filename.toString());
            }
        }
        else {
            part.setDataHandler(new DataHandler(new FileDataSource(content.getPath())));
            if (filename) {
                part.setFileName(filename.toString());
            }
            else {
                part.setFileName(content.getName());
            }
        }
        this.multipart.addBodyPart(part);
        return this;
    },

    /**
     * Send the email message
     *
     * @chainable
     */
    send: function() {
        var host = this.config.host,
            username = this.config.username,
            password = this.config.password,
            session = this.session,
            message = this.message,
            transport;

        if (host === 'localhost') {
            host = '127.0.0.1';
        }
        if (this.buffer !== null) {
            if (this.multipart !== null) {
                var part = new MimeBodyPart();
                part.setContent(this.buffer.toString(), 'text/plain');
                this.multipart.addBodyPart(part, 0);
                message.setContent(this.multipart);
            }
            else {
                message.setText(this.buffer.toString());
            }
        }
        else if (this.multipart !== null) {
            message.setContent(this.multipart);
        }
        else {
            message.setText('');
        }

        message.setSentDate(new Date());
        try {
            transport = session.getTransport('smtp');
            if (username && password) {
                transport.connect(host, username, password);
            }
            else {
                transport.connect();
            }
            message.saveChanges();
            transport.sendMessage(message, message.getAllRecipients());
        }
        finally {
            if (transport && transport.isConnected()) {
                transport.close();
            }
        }
        return this;
    }

});

decaf.extend(exports, {
    Mail: Mail
});
