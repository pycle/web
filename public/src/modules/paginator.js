"use strict";

/* globals app, define */

define('paginator', ['forum/pagination'], function(pagination) {
	var paginator = {},
		frame;
	
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
		
		frame = new Sly('#frame', options);
		frame.init();

		$('html').addClass('paginated'); // allows this to work for non-JS browsers

		$(window).on('resize', function() {
			frame.reload();
		}).on('action:ajaxify.end', function() {
			frame.reload();
		});

		window.derp = frame;
	};

	paginator.reload = function() {
		frame.reload();
	};

	return paginator;
});
