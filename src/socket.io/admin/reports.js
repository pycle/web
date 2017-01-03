"use strict";

var reports = require('../../reports');
var adminReports = module.exports;

adminReports.create = function (socket, data, callback) {
	if (!data || !data.hook) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	reports.create(data, callback);
};

adminReports.delete = function (socket, reportId, callback) {
	console.log(reportId);
	if (!reportId) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	reports.delete(reportId, callback);
};