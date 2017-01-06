"use strict";

var reports = require('../reports');
var socketReports = {};

socketReports.hookFired = function (socket, data, callback) {
	if (!data || !data.hook) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	reports.hookFired('client', data.hook);
	callback();
};

module.exports = socketReports;