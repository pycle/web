'use strict';

/* globals define, socket, ajaxify, translator, templates, app */

define('forum/infinitescroll', ['paginator'], function(paginator) {

	var scroll = {},
		loadingMore	= false;

	scroll.loadMore = function(method, data, callback) {
		if (loadingMore) {
			return;
		}
		
		loadingMore = true;
		socket.emit(method, data, function(err, data) {
			if (err) {
				loadingMore = false;
				return app.alertError(err.message);
			}
			callback(data, function() {
				loadingMore = false;
			});
		});
	};

	scroll.parseAndTranslate = function(template, blockName, data, callback) {
		templates.parse(template, blockName, data, function(html) {
			translator.translate(html, function(translatedHTML) {
				callback($(translatedHTML));
			});
		});
	};

	return scroll;
});