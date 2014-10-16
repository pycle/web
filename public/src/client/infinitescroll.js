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

	scroll.calculateAfter = function(direction, selector, count, reverse, callback) {
		var after = 0,
			offset = 0,
			el = direction > 0 ? $(selector).last() : $(selector).first(),
			increment;

		count = reverse ? -count : count;
		increment = reverse ? -1 : 1;

		if (direction > 0) {
			after = parseInt(el.attr('data-index'), 10) + increment;
		} else {
			after = parseInt(el.attr('data-index'), 10);
			if (isNaN(after)) {
				after = 0;
			}
			after -= count;
			if (after < 0) {
				after = 0;
			}
			if (el && el.offset()) {
				offset = el.offset().top - $('#header-menu').offset().top + $('#header-menu').height();
			}
		}

		callback(after, offset, el);
	};

	return scroll;
});