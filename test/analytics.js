'use strict';

var async = require('async');
var	assert = require('assert');
var nconf = require('nconf');
var request = require('request');

var db = require('./mocks/databasemock');
var categories = require('../src/categories');
var topics = require('../src/topics');
var user = require('../src/user');
var groups = require('../src/groups');
var helpers = require('./helpers');

describe('Analytics', function () {
	before(function (done) {
		done();
	});

	it('should 403 if user is not admin', function (done) {
		return done(false);
		/*helpers.loginUser('admin', 'barbar', function (err, _jar) {
			
		});*/
	});
});