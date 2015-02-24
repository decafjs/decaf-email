/**
 * Created with WebStorm.
 * User: mschwartz
 * Date: 6/14/14
 * Time: 2:07 PM
 */

var Mail = require('Mail').Mail;

function address( o ) {
    var pos;
    if ( decaf.isString(o) ) {
        pos = o.indexOf('<');
        if ( pos === -1 ) {
            return {
                name    : null,
                address : o
            };
        }
        var name = o.substr(o, pos),
            addr = o.substr(pos).replace('<', '').replace('>', '');
        return {
            name    : name,
            address : addr
        };
    }
    else if ( decaf.isArray(o) ) {
        if ( o[0].indexOf('@') !== -1 ) {
            return {
                name    : o[1],
                address : o[0]
            }
        }
        else if ( o[1].indexOf('@') !== -1 ) {
            return {
                name    : o[0],
                address : o[1]
            }
        }
    }
    else if ( decaf.isObject(o) ) {
        if ( o.address ) {
            return {
                name    : o.name,
                address : o.address
            }
        }
    }
    return null;
}

function Mandrill( config ) {
    var cfg = this.config = {
        host     : config.host,
        port     : config.port,
        username : config.username,
        password : config.password
    };

    if ( !cfg.host ) {
        throw new Error('Mandrill: config.host must be provided');
    }
    cfg.port = parseInt('' + cfg.port, 10);
    if ( !cfg.port ) {
        throw new Error('Mandrill: config.port must be provided');
    }
    if ( !cfg.username ) {
        throw new Error('Mandrill: config.username must be provided');
    }
    if ( !cfg.password ) {
        throw new Error('Mandrill: config.password must be provided');
    }
    if ( cfg.port !== 25 ) {
        cfg.tls = true;
    }
}
decaf.extend(Mandrill.prototype, {
    send : function( message ) {
        if ( !message.from ) {
            throw new Error('Mandrill.send: message.from not specified.');
        }
        if ( !message.to ) {
            throw new Error('Mandrill.send: message.to not specified.');
        }
        if ( !message.subject ) {
            throw new Error('Mandrill.send: message.subject not specified.');
        }
        if ( !message.text ) {
            throw new Error('Mandrill.send: message.text not specified');
        }
        if ( message.attachments && !decaf.isArray(message.attachments) ) {
            throw new Error('Mandrill.send: message.attachments must be an array');
        }

        var mail = new Mail(this.config),
            a = address(message.from);

        // handle headers
        if ( message.headers ) {
            decaf.each(message.headers, function( value, name ) {
                mail.setHeader(name, value);
            });
        }
        // handle from
        mail.setFrom(a.address, a.name);

        // handle to
        if ( decaf.isArray(message.to) ) {
            if ( message.to.length === 2 ) {
                a = address(message.to);
                if ( a ) {
                    mail.setTo(a.address, a.name);
                }
                else {
                    decaf.each(message.to, function( addr ) {
                        var a = address(addr);
                        mail.addTo(a.address, a.name);
                    });
                }
            }
            else {
                decaf.each(message.to, function( addr ) {
                    var a = address(addr);
                    mail.addTo(a.address, a.name);
                });
            }
        }
        else {
            a = address(message.to);
            mail.setTo(a.address, a.name);
        }

        // handle cc
        if ( message.cc ) {
            if ( decaf.isArray(message.cc) ) {
                if ( message.cc.length === 2 ) {
                    a = address(message.cc);
                    if ( a ) {
                        mail.setCc(a.address, a.name);
                    }
                    else {
                        decaf.each(message.cc, function( addr ) {
                            var a = address(addr);
                            mail.addCc(a.address, a.name);
                        });
                    }
                }
                else {
                    decaf.each(message.cc, function( addr ) {
                        var a = address(addr);
                        mail.addCc(a.address, a.name);
                    });
                }
            }
            else {
                a = address(message.cc);
                mail.setCc(a.address, a.name);
            }
        }

        // handle bcc
        if ( message.bcc ) {
            if ( decaf.isArray(message.bcc) ) {
                if ( message.cc.length === 2 ) {
                    a = address(message.bcc);
                    if ( a ) {
                        mail.setBcc(a.address, a.name);
                    }
                    else {
                        decaf.each(message.bcc, function( addr ) {
                            var a = address(addr);
                            mail.addBcc(a.address, a.name);
                        });
                    }
                }
                else {
                    decaf.each(message.bcc, function( addr ) {
                        var a = address(addr);
                        mail.addBcc(a.address, a.name);
                    });
                }
            }
            else {
                a = address(message.bcc);
                mail.setBcc(a.address, a.name);
            }
        }

        // subject
        mail.setSubject(message.subject);

        if ( mail.html ) {
            mail.addAttachment(mail.html, null, 'text/html');
        }
        if ( decaf.isArray(message.text) ) {
            mail.setText(message.text.join('\n'));
        }
        else {
            mail.setText(message.text);
        }

        if ( message.attachments ) {
            decaf.each(message.attachments, function( attachment ) {
                mail.addAttachment(attachment.content, attachment.filename, attachment.contentType);
            });
        }

        mail.send();
    }
});

decaf.extend(exports, {
    Mandrill: Mandrill
});
