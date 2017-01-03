<div class="custom-reports">
	<div class="row">
		<div class="col-xs-3">
			<!-- IF !hooksTracked.length -->
			<div class="alert alert-info">No custom reports have been created yet.</div>
			<!-- ELSE -->
			<div class="report-info">Select a hook to view data<br /><small>Ctrl-click to select multiple</small></div>
			<!-- ENDIF !hooksTracked.length -->

			<!-- BEGIN hooksTracked -->
			<div class="well trackedHook" data-hookType="{hooksTracked.type}" data-hookName="{hooksTracked.hook}" data-reportId="{hooksTracked.reportId}">
				<span class="badge">{hooksTracked.type} <i class="fa fa-line-chart fa-fw"></i> </span> <code>{hooksTracked.hook}</code>
				<span data-action="delete" class="fa fa-times"></span>
			</div>
			<!-- END hooksTracked -->
		</div>

		<div class="col-xs-9">
			<div class="panel panel-default">
				<div class="panel-heading">Hourly Report - Past 24 Hours</div>
				<div class="panel-body">
					<div class="graph-container">
						<canvas id="custom-report-hourly" width="100%" height="400"></canvas>
					</div>
				</div>
			</div>

			<div class="panel panel-default">
				<div class="panel-heading">Daily Report - Past Month</div>
				<div class="panel-body">
					<div class="graph-container">
						<canvas id="custom-report-daily" width="100%" height="400"></canvas>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<button data-action="create" class="floating-button mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
    <i class="material-icons">add</i>
</button>