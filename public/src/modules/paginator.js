"use strict";

/* globals app, define, utils, config, ajaxify, Sly */

define('paginator', ['forum/pagination'], function(pagination) {
	var paginator = {},
		frame,
		scrollbar,
		animationTimeout = null,
		index,
		count;
	
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
			releaseSwing: 1,
			swingSpeed: 0.1
		};
		
		frame = new Sly('#frame', options);
		frame.init();
		scrollbar = $('#scrollbar');

		$('html').addClass('paginated'); // allows this to work for non-JS browsers

		//todo key-bindings

		$(window).on('resize action:ajaxify.end', function() {
			paginator.update();
			paginator.reload();
		});

		frame.on('moveEnd', hideScrollbar);
		scrollbar.on('mouseout', hideScrollbar);

		frame.on('moveStart', showScrollbar);
		scrollbar.on('mouseover', showScrollbar);

		hideScrollbar();
	};

	paginator.reload = function() {
		frame.reload();
	};

	paginator.scrollToPost = function(postIndex, highlight, duration, offset) {
		if (!utils.isNumber(postIndex)) {
			return;
		}

		offset = offset || 0;
		duration = duration !== undefined ? duration : 400;
		paginator.scrollActive = true;

		if($('#post_anchor_' + postIndex).length) {
			return scrollToPid(postIndex, highlight, duration, offset);
		}

		if (config.usePagination) {
			if (window.location.search.indexOf('page') !== -1) {
				paginator.update();
				return;
			}

			var page = Math.ceil((postIndex + 1) / config.postsPerPage);

			if(parseInt(page, 10) !== pagination.currentPage) {
				pagination.loadPage(page, function() {
					scrollToPid(postIndex, highlight, duration, offset);
				});
			} else {
				scrollToPid(postIndex, highlight, duration, offset);
			}
		} else {
			paginator.scrollActive = false;
			postIndex = parseInt(postIndex, 10) + 1;
			ajaxify.go(generateUrl(postIndex));
		}
	};

	paginator.setCount = function(value) {
		count = parseInt(value, 10);
		updateTextAndProgressBar();
	};

	paginator.scrollTop = function(index) {
		if ($('li[data-index="' + index + '"]').length) {
			paginator.scrollToPost(index, true);
		} else {
			ajaxify.go(generateUrl());
		}
	};

	paginator.scrollBottom = function(index) {
		if (parseInt(index, 10) < 0) {
			return;
		}
		if ($('li[data-index="' + index + '"]').length) {
			paginator.scrollToPost(index, true);
		} else {
			index = parseInt(index, 10) + 1;
			ajaxify.go(generateUrl(index));
		}
	};

	//look into calculateIndex
	paginator.setup = function(selector, count, toTop, toBottom, callback, calculateIndex) {
		index = 1;
		paginator.selector = selector;
		paginator.callback = callback;
		toTop = toTop || function() {};
		toBottom = toBottom || function() {};

		paginator.disableForwardLoading = false;
		paginator.disableReverseLoading = false;

		$(window).on('scroll', paginator.update);
		paginator.setCount(count);

		paginator.update();
		paginator.reload();
	};

	var previousIndex;
	paginator.update = function() {
		var elements = $(paginator.selector).get();

		if (index > count / 2) {
			elements = elements.reverse();
		}

		$(elements).each(function() {
			var el = $(this);

			if (elementInView(el)) {
				if (typeof paginator.callback === 'function') {
					if (previousIndex !== index) {
						updateTextAndProgressBar();
						previousIndex = index;
					}

					paginator.callback(index, count);

					index = parseInt(el.attr('data-index'), 10) + 1;
				}

				return false;
			}
		});

		updateScrollbar();
	};

	var throttle = Date.now();

	paginator.onScroll = function(cb) {
		var prevPos = frame.pos.cur;
		
		frame.on('move', function(ev) {
			if ((Date.now() - throttle) < 150) {
				return;
			}

			throttle = Date.now();

			paginator.update();

			var curPos = frame.pos.cur,
				el, startLoadingAt, page;

			//if (curPos === frame.pos.end || destPos === frame.pos.end) {
			if (!paginator.disableForwardLoading && parseInt($($(paginator.selector).get(-1)).attr('data-index'), 10) === count) {
				paginator.disableForwardLoading = true;
			}

			if (!paginator.disableReverseLoading && parseInt($($(paginator.selector).get(1)).attr('data-index'), 10) === 1) {
				paginator.disableReverseLoading = true;
			}

			if (prevPos < curPos && !paginator.disableForwardLoading) {
				el = $($(paginator.selector).get(-10));
				if (elementInView(el, 1)) {
					startLoadingAt = el.nextAll('[data-index]').last();
					startLoadingAt = startLoadingAt.attr('data-index');
					page = Math.ceil(startLoadingAt / config.postsPerPage);

					cb(1, startLoadingAt, function() {
						paginator.update();
						paginator.reload();
					});
				}
			} else if (prevPos > curPos && !paginator.disableReverseLoading) {
				el = $($(paginator.selector).get(10));
				if (elementInView(el, -1)) {
					startLoadingAt = (el.prevAll().not(paginator.selector)).first().next();
					startLoadingAt = startLoadingAt.attr('data-index') - config.postsPerPage;

					startLoadingAt = startLoadingAt > 0 ? startLoadingAt : 0;
					page = Math.floor(startLoadingAt / config.postsPerPage);

					var originalSize;

					cb(-1, startLoadingAt, function() {
						frame.slideBy($('#content').height() - originalSize, true);
						paginator.update();
						paginator.reload();
					});
				}
			}
			
			prevPos = curPos;
		});

		frame.on('moveEnd', function(ev) {

		});
	};

	function updateScrollbar() {
		var paddingTop = 60,
			paddingBottom = 10,

			heightPerElement = frame.rel.slideeSize / $(paginator.selector).length,
			areaMissingAtBottom = (count - parseInt($($(paginator.selector).get(-1)).attr('data-index'), 10)) * heightPerElement,
			areaMissingAtTop = parseInt($($(paginator.selector).get(1)).attr('data-index'), 10) * heightPerElement,

			totalArea = count * heightPerElement,
			scrollbarBottom = Math.max((areaMissingAtBottom / totalArea * frame.rel.frameSize), paddingBottom),
			scrollbarTop = Math.max((areaMissingAtTop / totalArea * frame.rel.frameSize), paddingTop);

		$('#scrollbar').css('bottom', scrollbarBottom + 'px');
		$('#scrollbar').css('top', scrollbarTop + 'px');
	}

	function generateUrl(index) {
		var parts = window.location.pathname.split('/');
		return parts[1] + '/' + parts[2] + '/' + parts[3] + (index ? '/' + index : '');
	}

	function updateTextAndProgressBar() {
		index = index > count ? count : index;
		$('#pagination').translateHtml('[[global:pagination.out_of, ' + index + ', ' + count + ']]');
	}

	function elementInView(el, orPastDirection) {
		var scrollTop = $(window).scrollTop() + $('#header-menu').height();
		var scrollBottom = scrollTop + $(window).height();

		var elTop = el.offset().top;
		var elBottom = elTop + Math.floor(el.height());
		if (orPastDirection) {
			if (orPastDirection === 1) {
				return scrollBottom >= elTop;
			} else {
				return elBottom <= scrollTop;
			}
		} else {
			return (elTop >= scrollTop && elBottom <= scrollBottom) || (elTop <= scrollTop && elBottom >= scrollTop);	
		}
		
	}

	function scrollToPid(postIndex, highlight, duration, offset) {
		var scrollTo = $('#post_anchor_' + postIndex);

		if (!scrollTo) {
			paginator.scrollActive = false;
			return;
		}

		var done = false;
		function animateScroll() {
			//todo, ask baris about duration

			frame.slideTo(scrollTo.offset().top - $('#header-menu').height() - offset);
			frame.one('moveEnd', function() {
				if (done) {
					return;
				}
				done = true;

				paginator.scrollActive = false;
				paginator.update();
				highlightPost();

				// what is this for
				$('body').scrollTop($('body').scrollTop() - 1);
				$('html').scrollTop($('html').scrollTop() - 1);
			});
		}

		function highlightPost() {
			if (highlight) {
				scrollTo.parent().find('.topic-item').addClass('highlight');
				setTimeout(function() {
					scrollTo.parent().find('.topic-item').removeClass('highlight');
				}, 3000);
			}
		}

		if ($('#post-container').length) {
			animateScroll();
		}
	}

	function hideScrollbar() {
		clearTimeout(animationTimeout);
		animationTimeout = setTimeout(function() {
			scrollbar.addClass('translucent');
			$(window).trigger('action:paginator.hide');
		}, 1000);
	}

	function showScrollbar() {
		clearTimeout(animationTimeout);
		scrollbar.removeClass('translucent');
	}

	return paginator;
});
