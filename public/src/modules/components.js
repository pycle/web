'use strict';

define('components', function () {
	var components = {};

	components.core = {
		'topic/teaser': function (tid) {
			if (tid) {
				var cmp = getComponent('category/topic', 'tid', tid);
				return components.findInComponent(cmp, 'topic/teaser');
			}
			return getComponent('topic/teaser');
		},
		topic: function (name, value) {
			return getComponent('topic', name, value);
		},
		post: function (name, value) {
			return getComponent('post', name, value);
		},
		'post/content': function (pid) {
			return components.findInComponent(components.core.post('pid', pid), 'post/content');
		},
		'post/header': function (pid) {
			return components.findInComponent(components.core.post('pid', pid), 'post/header');
		},
		'post/anchor': function (index) {
			return components.findInComponent(components.core.post('index', index), 'post/anchor');
		},
		'post/vote-count': function (pid) {
			return components.findInComponent(components.core.post('pid', pid), 'post/vote-count');
		},
		'post/bookmark-count': function (pid) {
			return components.findInComponent(components.core.post('pid', pid), 'post/bookmark-count');
		},

		'user/postcount': function (uid) {
			return getComponent('user/postcount', 'uid', uid);
		},
		'user/reputation': function (uid) {
			return getComponent('user/reputation', 'uid', uid);
		},

		'category/topic': function (name, value) {
			return getComponent('category/topic', name, value);
		},
		'categories/category': function (name, value) {
			return getComponent('categories/category', name, value);
		},

		'chat/message': function (messageId) {
			return getComponent('chat/message', 'mid', messageId);
		},
		'chat/message/body': function (messageId) {
			return components.findInComponent(getComponent('chat/message', 'mid', messageId), 'chat/message/body');
		},
	};

	components.get = function () {
		var args = Array.prototype.slice.call(arguments, 1);

		if (components.core[arguments[0]] && args.length) {
			return components.core[arguments[0]].apply(this, args);
		}

		return getComponent(arguments[0]);
	};

	function getComponent(componentName, dataName, dataValue) {
		var dataSelector = '';
		if (dataName && dataValue) {
			dataSelector = '[data-' + dataName + '="' + dataValue + '"]';
		}
		var cmp = $('[data-component="' + componentName + '"]' + dataSelector);
		if (!cmp.length) {
			// backwards compatibility
			cmp = $('[component="' + componentName + '"]' + dataSelector);
		}
		return cmp;
	}

	components.findInComponent = function(cmp, componentName) {
		var child = cmp.find('[data-component="' + componentName + '"]');
		if (!child.length) {
			// backwards compatibility
			child = cmp.find('[component="' + componentName + '"]');
		}
		return child;
	};

	return components;
});
