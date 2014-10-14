"use strict";

/* globals app, define, Sly */

define('paginator', ['forum/pagination'], function(pagination) {
	var paginator = {},
		frame,
		scrollbar;
	
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
		scrollbar = $('#scrollbar');

		$('html').addClass('paginated'); // allows this to work for non-JS browsers

		$(window).on('resize', function() {
			frame.reload();
		}).on('action:ajaxify.end', function() {
			frame.reload();
		});

		frame.on('moveEnd', hideScrollbar);
		scrollbar.on('mouseout', hideScrollbar);

		frame.on('moveStart', showScrollbar);
		scrollbar.on('mouseover', showScrollbar);
	};

	paginator.reload = function() {
		frame.reload();
	};

	function hideScrollbar() {
		setTimeout(function() {
			scrollbar.addClass('translucent');
		}, 3000);
	}

	function showScrollbar() {
		scrollbar.removeClass('translucent');
	}

	return paginator;
});
