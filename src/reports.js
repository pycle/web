"use strict";

var analytics = require('./analytics');
var db = require('./database');
var async = require('async');
var reports = module.exports;

reports.new = function (hook, callback) {
	if (!hook) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	db.setAdd('reports:hooks_tracked', hook, callback);
};

reports.delete = function (hook, callback) {
	if (!hook) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	db.setRemove('reports:hooks_tracked', hook, callback);
};

reports.getTrackedHooks = function (callback) {
	db.getSetMembers('reports:hooks_tracked', function (err, hooks_tracked) {
		if (err) {
			return callback(err);
		}

		async.each(hooks_tracked, function (hook, next) {
			async.parallel({
				'hourly': async.apply(analytics.getHourlyStatsForSet, 'reports:' + hook, Date.now(), 24),
				'daily': async.apply(analytics.getDailyStatsForSet, 'reports:' + hook, Date.now(), 30)
			}, next);
		}, callback);
	});
};