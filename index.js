/**
 * Created with JetBrains WebStorm.
 * User: mschwartz
 * Date: 7/23/13
 * Time: 11:05 AM
 * To change this template use File | Settings | File Templates.
 */

/*global decaf, require */

"use strict";

decaf.extend(exports, {
    Mail     : require('lib/Mail').Mail,
    Mandrill : require('lib/Mandrill').Mandrill,
    EZMail   : require('lib/EZMail').EZMail
});
