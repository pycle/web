"use strict";

var analytics = require('./analytics');
var db = require('./database');
var async = require('async');
var reports = module.exports;

reports.create = function (hook, callback) {
	if (!hook) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	db.incrObjectField('global', 'nextReportId', function(err, reportId) {
		db.setAdd('reports:hooks_tracked', reportId);
		db.setObject('reports:hooks_tracked:' + reportId, hook, callback);
	});
};

reports.delete = function (reportId, callback) {
	if (!reportId) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	db.setRemove('reports:hooks_tracked', reportId);
	db.delete('reports:hooks_tracked:' + reportId, callback);
};

reports.getTrackedHooks = function (callback) {
	db.getSetMembers('reports:hooks_tracked', function (err, hooks_tracked) {
		if (err) {
			return callback(err);
		}

		var tracked = [];

		async.each(hooks_tracked, function (reportId, next) {
			db.getObject('reports:hooks_tracked:' + reportId, function(err, hook) {				
				async.parallel({
					'hourly': async.apply(analytics.getHourlyStatsForSet, 'reports:' + hook.type + ':' + hook.name, Date.now(), 24),
					'daily': async.apply(analytics.getDailyStatsForSet, 'reports:' + hook.type + ':' + hook.name, Date.now(), 30)
				}, function (err, stats) {
					hook.stats = stats;
					hook.reportId = reportId;
					tracked.push(hook);
					next(err);
				});
			});
		}, function(err) {
			callback(err, tracked);
		});
	});
};