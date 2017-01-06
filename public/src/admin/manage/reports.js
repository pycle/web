"use strict";
/*global define, ajaxify, app, socket, utils, bootbox, templates*/

define('admin/manage/reports', ['Chart'], function (Chart) {
	var	reports = {};
	var charts = {};

	var hookCategories = {
		server: Object.keys(ajaxify.data.availableHooks.server),
		client: Object.keys(ajaxify.data.availableHooks.client)
	};

	reports.init = function () {
		$('[data-action="create"]').on('click', openReportModal);
		$('[data-action="delete"]').on('click', deleteReport);

		setupHookHandlers();
		setupGraphs();
	};

	function setupHookHandlers () {
		$('.trackedHook').on('click', function(ev) {
			var displayed = ev.ctrlKey ? JSON.parse(localStorage.getItem('acp.reports:displayed_hooks')) : [];
			var reportId = parseInt($(this).attr('data-reportId'), 10);
			
			if (displayed.indexOf(reportId) !== -1) {
				displayed.splice(displayed.indexOf(reportId), 1);
			} else {
				displayed.push(reportId);
			}

			localStorage.setItem('acp.reports:displayed_hooks', JSON.stringify(displayed));
			setupGraphs();
		});
	}

	function openReportModal () {
		templates.parse('admin/partials/create_report_modal', {}, function (html) {
			var modal = bootbox.dialog({
				message: html,
				title: '[[admin/manage/users:alerts.create]]',
				onEscape: true,
				buttons: {
					cancel: {
						label: '[[admin/manage/users:alerts.button-cancel]]',
						className: 'btn-link'
					},
					create: {
						label: '[[admin/manage/users:alerts.button-create]]',
						className: 'btn-primary',
						callback: function () {
							createReport(this);
							return false;
						}
					}
				}
			});

			var typeSelector = modal.find('#hook-type');
			var categorySelector = modal.find('#hook-category');
			var hookSelector = modal.find('#hook-name');

			typeSelector.on('change', function() {
				categorySelector.html('');

				hookCategories[typeSelector.val()].forEach(function(category) {
					categorySelector.append($('<option value="' + category + '">' + category + '</option>'));
				});

				categorySelector.change();
			});

			categorySelector.on('change', function() {
				hookSelector.html('');

				ajaxify.data.availableHooks[typeSelector.val()][categorySelector.val()].hooks.forEach(function(hook) {
					if ($('.trackedHook[data-hookType="' + typeSelector.val() + '"][data-hookName="' + hook.hook + '"]').length) {
						return;
					}

					hookSelector.append($('<option value="' + hook.hook + '">' + hook.hook + '</option>'));
				});
			});

			typeSelector.change();
			categorySelector.change();
		});
	}

	function createReport (modal) {
		var report = {
			type: modal.find('#hook-type').val(),
			category: modal.find('#hook-category').val(),
			hook: modal.find('#hook-name').val()
		};

		socket.emit('admin.reports.create', report, function (err) {
			if (err) {
				return $('#create-modal-error').translateHtml(err.message).removeClass('hide');
			}

			modal.modal('hide');
			modal.on('hidden.bs.modal', function () {
				ajaxify.refresh();
				app.alertSuccess('[[admin/manage/users:alerts.create-success]]');
			});
		});
	}

	function deleteReport (ev) {
		ev.stopPropagation();

		var reportId = $(this).parents().attr('data-reportId');

		bootbox.confirm('[[admin/admin:alert.confirm-restart]]', function (confirm) {
			if (confirm) {
				socket.emit('admin.reports.delete', reportId, function (err) {
					if (err) {
						return app.alertError(err);
					}

					ajaxify.refresh();
				});
			}
		});
	}

	function setupGraphs() {
		$('.trackedHook').removeClass('active');

		setupGraph('daily');
		setupGraph('hourly');
	}

	function setupGraph(type) {
		var canvas = document.getElementById('custom-report-' + type);
		var context = canvas.getContext('2d');
		var displayed = JSON.parse(localStorage.getItem('acp.reports:displayed_hooks'));
		var datasets = [];

		for (var i = 0, ii = ajaxify.data.hooksTracked.length; i < ii; i++) {
			var hookData = ajaxify.data.hooksTracked[i];

			if (displayed.indexOf(parseInt(hookData.reportId, 10)) !== -1) {				
				var color = i * 40 % 360;
				datasets.push({
					label: hookData.hook,
					backgroundColor: 'hsla(' + color + ', 100%, 50%, 0.25)',
					borderColor: 'hsl(' + color + ', 50%, 50%)',
					pointBackgroundColor: 'hsl(' + color + ', 50%, 50%)',
					pointHoverBackgroundColor: "#fff",
					pointBorderColor: "#fff",
					pointHoverBorderColor: 'hsl(' + color + ', 75%, 50%)',
					data: hookData.stats[type]
				});

				$('.trackedHook[data-reportId="' + hookData.reportId + '"]').addClass('active');
			}
		}

		charts[type] = new Chart(context, {
			type: 'line',
			data: {
				labels: utils[type === 'daily' ? 'getDaysArray' : 'getHoursArray']().map(function (text, idx) {
					return idx % 3 ? '' : text;
				}),
				datasets: datasets
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				legend: {
					display: true,
					onClick: function() { return false; }
				},
				scales: {
					yAxes: [{
						ticks: {
							beginAtZero: true
						}
					}]
				}
			}
		});
	}

	return reports;
});
