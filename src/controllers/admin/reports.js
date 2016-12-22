"use strict";

var reports = require('../../reports');
var reportsController = {};

reportsController.get = function (req, res, next) {
	reports.getTrackedHooks(function (err, hooks_tracked) {
		if (err) {
			return next(err);
		}

		res.render('admin/manage/reports', hooks_tracked);
	});
};

module.exports = reportsController;
