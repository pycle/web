'use strict';


/* globals define, app, templates, translator, socket, bootbox, config, ajaxify, RELATIVE_PATH, utils */

define('forum/topic', [
	'forum/pagination',
	'forum/infinitescroll',
	'forum/topic/threadTools',
	'forum/topic/postTools',
	'forum/topic/events',
	'forum/topic/browsing',
	'forum/topic/posts',
	'paginator',
	'sort'
], function(pagination, infinitescroll, threadTools, postTools, events, browsing, posts, paginator, sort) {
	var	Topic = {},
		currentUrl = '';

	$(window).on('action:ajaxify.start', function(ev, data) {
		if(data.url.indexOf('topic') !== 0) {
			$('.header-topic-title').find('span').text('').hide();
			app.removeAlert('bookmark');

			events.removeListeners();
		}
	});

	Topic.init = function() {
		var tid = ajaxify.variables.get('topic_id'),
			thread_state = {
				locked: ajaxify.variables.get('locked'),
				deleted: ajaxify.variables.get('deleted'),
				pinned: ajaxify.variables.get('pinned')
			};

		$(window).trigger('action:topic.loading');

		app.enterRoom('topic_' + tid);

		posts.processPage($('.topic'));

		postTools.init(tid, thread_state);
		threadTools.init(tid, thread_state);
		events.init();

		sort.handleSort('topicPostSort', 'user.setTopicSort', 'topic/' + ajaxify.variables.get('topic_slug'));

		enableInfiniteLoadingOrPagination();

		addBlockQuoteHandler();

		paginator.setup('.posts > .post-row', ajaxify.variables.get('postcount'), Topic.toTop, Topic.toBottom, Topic.navigatorCallback, Topic.calculateIndex);
		handleBookmark(tid);

		$(window).on('scroll', updateTopicTitle);

		if (utils.isMobile()) {
			$(window).on('action:paginator.hide', replaceState);
		}

		$(window).trigger('action:topic.loaded');
		if (app.user.uid) {
			socket.emit('topics.enter', tid, function(err, data) {
				if (err) {
					return app.alertError(err.message);
				}
				browsing.onUpdateUsersInRoom(data);
			});
		}
	};

	Topic.toTop = function() {
		paginator.scrollTop(0);
	};

	Topic.toBottom = function() {
		socket.emit('topics.postcount', ajaxify.variables.get('topic_id'), function(err, postCount) {
			if (config.topicPostSort !== 'oldest_to_newest') {
				postCount = 2;
			}
			paginator.scrollBottom(postCount - 1);
		});
	};

	function handleBookmark(tid) {
		var bookmark = localStorage.getItem('topic:' + tid + ':bookmark');
		var postIndex = getPostIndex();
		if (postIndex) {
			paginator.scrollToPost(postIndex - 1, true);
		} else if (bookmark && (!config.usePagination || (config.usePagination && pagination.currentPage === 1)) && ajaxify.variables.get('postcount') > 1) {
			app.alert({
				alert_id: 'bookmark',
				message: '[[topic:bookmark_instructions]]',
				timeout: 0,
				type: 'info',
				clickfn : function() {
					paginator.scrollToPost(parseInt(bookmark, 10), true);
				},
				closefn : function() {
					localStorage.removeItem('topic:' + tid + ':bookmark');
				}
			});
		}
	}

	function getPostIndex() {
		var parts = window.location.pathname.split('/');
		if (parts[parts.length - 1] && utils.isNumber(parts[parts.length - 1])) {
			return parseInt(parts[parts.length - 1], 10);
		}
		return 0;
	}

	function addBlockQuoteHandler() {
		$('#post-container').on('click', 'blockquote .toggle', function() {
			var blockQuote = $(this).parent('blockquote');
			var toggle = $(this);
			blockQuote.toggleClass('uncollapsed');
			var collapsed = !blockQuote.hasClass('uncollapsed');
			toggle.toggleClass('fa-angle-down', collapsed).toggleClass('fa-angle-up', !collapsed);
		});
	}


	function enableInfiniteLoadingOrPagination() {
		if(!config.usePagination) {
			paginator.onScroll(posts.loadMorePosts);
		} else {
			pagination.init(parseInt(ajaxify.variables.get('currentPage'), 10), parseInt(ajaxify.variables.get('pageCount'), 10));
		}
	}


	function updateTopicTitle() {
		if($(window).scrollTop() > 50) {
			$('.header-topic-title').find('span').text(ajaxify.variables.get('topic_name')).show();
		} else {
			$('.header-topic-title').find('span').text('').hide();
		}
	}

	Topic.calculateIndex = function(index, elementCount) {
		if (index !== 1 && config.topicPostSort !== 'oldest_to_newest') {
			return elementCount - index + 2;
		}
		return index;
	};

	var previousIndex;

	Topic.navigatorCallback = function(index, count) {
		if (previousIndex === index) {
			return;
		}

		previousIndex = index;

		var path = ajaxify.removeRelativePath(window.location.pathname.slice(1));
		if (!path.startsWith('topic')) {
			return 1;
		}
		
		if (config.topicPostSort !== 'oldest_to_newest') {
			index = Math.max(count - index, 1) || 1;
		}

		var currentBookmark = localStorage.getItem('topic:' + ajaxify.variables.get('topic_id') + ':bookmark');

		if (!currentBookmark || parseInt(index, 10) > parseInt(currentBookmark, 10)) {
			localStorage.setItem('topic:' + ajaxify.variables.get('topic_id') + ':bookmark', index - 1);
			app.removeAlert('bookmark');
		}

		if (!utils.isMobile()) {
			replaceState();	
		}
	};

	function replaceState() {
		if (!paginator.scrollActive && history.replaceState) {
			var parts = ajaxify.removeRelativePath(window.location.pathname.slice(1)).split('/'),
				topicId = parts[1],
				slug = parts[2],
				newUrl = 'topic/' + topicId + '/' + (slug ? slug : '');

			if (previousIndex > 0) {
				newUrl += '/' + previousIndex;
			}

			if (newUrl !== currentUrl) {
				var search = (window.location.search ? window.location.search : '');
				history.replaceState({
					url: newUrl + search
				}, null, window.location.protocol + '//' + window.location.host + RELATIVE_PATH + '/' + newUrl + search);

				currentUrl = newUrl;
			}
		}
	}

	return Topic;
});
