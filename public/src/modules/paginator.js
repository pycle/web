"use strict";

/* globals app, define, utils, config, ajaxify, Sly */

define('paginator', ['forum/pagination'], function(pagination) {
	var paginator = {},
		frame,
		content,
		scrollbar,
		animationTimeout = null,
		index,
		count;
	
	paginator.init = function() {
		frame = $('#frame');
		content = $('#content');
		scrollbar = $('#scrollbar');

		$(window).on('resize action:ajaxify.end', function() {
			paginator.update();
		});

		scrollbar.on('mouseout', hideScrollbar);
		scrollbar.on('mouseover', showScrollbar);

		frame.on('scroll', function() {
			showScrollbar();
			hideScrollbar();
		});

		hideScrollbar();
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

		// might be best to only call this on new post
		updateScrollbar();
	};

	paginator.onScroll = function(cb) {
		var prevPos = frame.scrollTop();
		

		frame.scroll(function(ev) {
			paginator.update();

			var curPos = frame.scrollTop(),
				el, startLoadingAt;

			if (!paginator.disableForwardLoading && parseInt($($(paginator.selector).get(-1)).attr('data-index'), 10) === count) {
				paginator.disableForwardLoading = true;
			}

			if (!paginator.disableReverseLoading && parseInt($($(paginator.selector).get(1)).attr('data-index'), 10) === 1) {
				paginator.disableReverseLoading = true;
			}

			if (prevPos < curPos && !paginator.disableForwardLoading) {
				el = $($(paginator.selector).get(-10));
				
				if (parseInt(el.attr('data-index'), 10) < index) {
					startLoadingAt = el.nextAll('[data-index]').last();
					startLoadingAt = startLoadingAt.attr('data-index');

					cb(1, startLoadingAt, paginator.update);
				}
			} else if (prevPos > curPos && !paginator.disableReverseLoading) {
				el = $($(paginator.selector).get(10));
				
				if (parseInt(el.attr('data-index'), 10) > index) {
					startLoadingAt = (el.prevAll().not(paginator.selector)).first().next();
					startLoadingAt = startLoadingAt.attr('data-index') - config.postsPerPage;
					startLoadingAt = startLoadingAt > 0 ? startLoadingAt : 0;

					var originalSize = $('#content').height();

					cb(-1, startLoadingAt, function() {
						var slide = $('#content').height() - originalSize;						
						paginator.update();

						frame.scrollTop(slide + frame.scrollTop());
					});
				}
			}
			
			prevPos = curPos;
		});
	};

	function updateScrollbar() {
		var paddingTop = 60,
			paddingBottom = 10,

			heightPerElement = content.height() / $(paginator.selector).length,
			areaMissingAtBottom = (count - parseInt($($(paginator.selector).get(-1)).attr('data-index'), 10)) * heightPerElement,
			areaMissingAtTop = parseInt($($(paginator.selector).get(1)).attr('data-index'), 10) * heightPerElement,

			totalArea = count * heightPerElement,
			scrollbarBottom = Math.max((areaMissingAtBottom / totalArea * frame.height()), paddingBottom),
			scrollbarTop = Math.max((areaMissingAtTop / totalArea * frame.height()), paddingTop);

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
			$('#frame').animate({
				scrollTop: (scrollTo.offset().top - $('#header-menu').height() - offset) + 'px'
			}, duration, function() {
				if (done) {
					return;
				}
				done = true;

				paginator.scrollActive = false;
				paginator.update();
				highlightPost();

				//what is this for
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
