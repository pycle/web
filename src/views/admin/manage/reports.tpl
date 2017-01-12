<div class="custom-reports">
	<div class="row">
		<div class="col-xs-3">
			<!-- IF !hooksTracked.length -->
			<div class="alert alert-info">[[admin/manage/reports:none]]</div>
			<!-- ELSE -->
			<div class="report-info">[[admin/manage/reports:select_a_hook]]<br /><small>[[admin/manage/reports:ctrl_click]]</small></div>
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
				<div class="panel-heading">[[admin/manage/reports:hourly]]</div>
				<div class="panel-body">
					<div class="graph-container">
						<canvas id="custom-report-hourly" width="100%" height="400"></canvas>
					</div>
				</div>
			</div>

			<div class="panel panel-default">
				<div class="panel-heading">[[admin/manage/reports:daily]]</div>
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