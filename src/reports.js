"use strict";

var analytics = require('./analytics');
var db = require('./database');
var async = require('async');
var winston = require('winston');
var reports = module.exports;

reports.hooksToListenTo = {server: [], client: []};

reports.create = function (hook, callback) {
	if (!hook) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	db.incrObjectField('global', 'nextReportId', function (err, reportId) {
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
	db.getSetMembers('reports:hooks_tracked', function (err, reportIds) {
		if (err) {
			return callback(err);
		}

		var tracked = [];

		async.each(reportIds, function (reportId, next) {
			db.getObject('reports:hooks_tracked:' + reportId, function (err, hook) {
				hook.reportId = reportId;
				tracked.push(hook);
				reports.hooksToListenTo[hook.type].push(hook.hook);
				next(err);
			});
		}, function (err) {
			callback(err, tracked);
		});
	});
};

reports.getTrackedHooksData = function (callback) {
	reports.getTrackedHooks(function (err, hooks) {
		async.each(hooks, function (hook, next) {
			async.parallel({
				'hourly': async.apply(analytics.getHourlyStatsForSet, 'analytics:' + hook.type + ':' + hook.hook, Date.now(), 24),
				'daily': async.apply(analytics.getDailyStatsForSet, 'analytics:' + hook.type + ':' + hook.hook, Date.now(), 30)
			}, function (err, stats) {
				hook.stats = stats;
				next(err);
			});
		}, function (err) {
			callback(err, hooks);
		});
	});
};

reports.hookFired = function (type, hook) {
	if (!type || !hook) {
		return winston.error('[reports] Invalid hook data: ', type, hook);
	}

	if (reports.hooksToListenTo[type].indexOf(hook) !== -1) {
		analytics.increment([type + ':' + hook]);
	}
};

reports.init = function (callback) {
	reports.getTrackedHooks(function () { callback(null); });
};