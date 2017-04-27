'use strict';

var Q = require('q');
var config = require('meanio').loadConfig();
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var EmailTemplate = require('../../../mail-templates/node_modules/email-templates').EmailTemplate;
var path = require('path');

function send(mailOptions) {
  var options = config.mailer;

  if (config.mailer.service === 'SMTP') {
    options = smtpTransport(options);
  }

  var transport = nodemailer.createTransport(options);
  return Q.ninvoke(transport, 'sendMail', mailOptions);
}

function render(type, data) {
  var templateDir = path.join(__dirname, '..', 'templates', type);
  var template = new EmailTemplate(templateDir);

  return template.render(data);
}

exports.send = function(type, data) {
  if (type === 'comment_email') {
    return;
  }

  data.uriRoot = config.host;
  data.date = new Date();

  //HACK
  var recipients = data.discussion.watchers;

 /**
  recipients.push(data.discussion.assign);
  recipients.push(data.discussion.creator);
  recipients.concat(data.discussion.members);
  */

  data.attendees = [];
  var ids = [],
    emails = [];

  for (var i = 0; i < recipients.length; i++) {
    if (ids.indexOf(recipients[i]._id.toString()) === -1) {
      ids.push(recipients[i]._id.toString());
      emails.push(recipients[i].email);
      data.attendees.push(recipients[i].name);
    }
  }

  data.attendees.join(', ');

  return render(type, data).then(function(results) {
    var promises = emails.map(function(recipient) {
      var mailOptions = {
        to: recipient,
        from: config.emailFrom,
        subject: data.discussion.title,
        html: results.html,
        text: results.text,
        forceEmbeddedImages: true
      };

      return send(mailOptions);
    });

    return Q.all(promises);
  });
};

exports.system = function(data) {
  data.uriRoot = config.host;
  data.date = new Date();
  var recipients = config.system.recipients;
  var r = [];
  for (var i in recipients) {
    r.push(recipients[i]);
  }

  return render('system', data).then(function(results) {
    var promises = r.map(function(recipient) {
      var mailOptions = {
        to: recipient,
        from: config.emailFrom,
        subject: 'Root System',
        html: results.html,
        text: results.text,
        forceEmbeddedImages: true
      };

      return send(mailOptions);
    });

    return Q.all(promises);
  });
};
