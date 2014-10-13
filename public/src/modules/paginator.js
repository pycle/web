"use strict";

/* globals app, define */

define('paginator', ['forum/pagination'], function(pagination) {
	var paginator = {};
	
	paginator.init = function() {
		var options = {
			scrollBy: 200,
			speed: 200,
			easing: 'easeOutQuart',
			scrollBar: '#scrollbar',
			dynamicHandle: 1,
			dragHandle: 1,
			clickBar: 1,
			mouseDragging: 1,
			touchDragging: 1,
			releaseSwing: 1
		};
		var frame = new Sly('#frame', options);

		// Initiate frame
		frame.init();

		$('html').addClass('paginated'); // allows this to work for non-JS browsers

		// Reload on resize
		$(window).on('resize', function() {
			frame.reload();
		}).on('action:ajaxify.end', function() {
			setTimeout(function() {
				frame.reload();
			}, 50);
		});


		window.derp = frame;
	};

	return paginator;
});
