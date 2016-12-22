<div class="custom-reports">
	<div class="row">
		<div class="col-xs-3">
			<!-- IF !reports.length -->
			<div class="alert alert-info">No custom reports have been created yet.</div>
			<!-- ENDIF !reports.length -->

			<!-- BEGIN reports -->
			<div class="well">
				<strong>{reports.name}</strong> <small>Tracking <code>{reports.hook}</code> hook</small>
				<span class="pull-right">
					<div class="btn-group">
						<button class="btn btn-default"><i class="fa fa-line-chart"></i></a>
						<button data-cid="1" class="btn btn-danger">Delete Report</button>
					</div>
				</span>
			</div>
			<!-- END reports -->
		</div>

		<div class="col-xs-9">
			<div class="panel panel-default">
				<div class="panel-heading">Custom Reports</div>
				<div class="panel-body">
					<div class="graph-container">
						<ul class="graph-legend">
							<li><div class="page-views"></div><span>[[admin/general/dashboard:page-views]]</span></li>
							<li><div class="unique-visitors"></div><span>[[admin/general/dashboard:unique-visitors]]</span></li>
						</ul>
						<canvas id="analytics-traffic" width="100%" height="400"></canvas>
					</div>
					<hr/>
					<div class="text-center pull-left monthly-pageviews">
						<div><strong id="pageViewsLastMonth"></strong></div>
						<div><a href="#" data-action="updateGraph" data-units="days" data-until="last-month">[[admin/general/dashboard:page-views-last-month]]</a></div>
					</div>
					<div class="text-center pull-left monthly-pageviews">
						<div><strong id="pageViewsThisMonth"></strong></div>
						<div><a href="#" data-action="updateGraph" data-units="days">[[admin/general/dashboard:page-views-this-month]]</a></div>
					</div>
					<div class="text-center pull-left monthly-pageviews">
						<div><strong id="pageViewsPastDay"></strong></div>
						<div><a href="#" data-action="updateGraph" data-units="hours">[[admin/general/dashboard:page-views-last-day]]</a></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
