"use strict";

var reports = require('../../reports');
var cache = require('lru-cache')({ max: 40000, maxAge: 1000 * 60 * 60 });
var availableHooks = cache.get('hooks:available');
var nconf = require('nconf');
var reportsController = {};

reportsController.get = function (req, res, next) {
	if (availableHooks) {
		return renderPage(req, res, next);
	} else {
		getAvailableHooks(function () {
			renderPage(req, res, next);
		});
	}
};

function renderPage (req, res, next) {	
	reports.getTrackedHooksData(function (err, hooksTracked) {
		if (err) {
			return next(err);
		}

		res.render('admin/manage/reports', {
			hooksTracked: hooksTracked,
			availableHooks: availableHooks
		});
	});
}

function getAvailableHooks (callback) {
	var url = (nconf.get('hooks_url') || 'https://hooks.nodebb.org');

	require('request')(url, {
		json: true
	}, function (err, res, body) {
		if (res.statusCode === 404 || !body) {
			return callback(err, {});
		}

		availableHooks = body;
		cache.set('hooks:available', body);
		callback();
	});
}

module.exports = reportsController;
