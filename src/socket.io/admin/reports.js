"use strict";

var analytics = require('../../analytics');
var db = require('../../database');
var reports = require('../../reports');
var adminReports = module.exports;

adminReports.new = function (socket, data, callback) {
	if (!data || data.hook) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	reports.new(data.hook, callback);
};

adminReports.delete = function (socket, data, callback) {
	if (!data || data.hook) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	reports.delete(data.hook, callback);
};