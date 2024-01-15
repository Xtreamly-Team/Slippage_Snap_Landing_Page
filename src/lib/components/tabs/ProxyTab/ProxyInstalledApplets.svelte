<script lang="ts">
	import { explainCron, type ExecutionPerscriptionLog, type ProxyAddresses} from 'xtreamly_sdk';
	import ProxyLogsDialog from './ProxyLogsDialog.svelte';

	type InstalledAppletTableRow = {
		appletName: string;
		cron: string;
		logs: ExecutionPerscriptionLog[];
	};

	let shownLogs: ExecutionPerscriptionLog[] = [];

	let proxyLogsDialog: ProxyLogsDialog;

	export let rows: InstalledAppletTableRow[];

</script>

<div class="w-full overflow-x-auto">
	<table class="table table-xs">
		<!-- head -->
		<thead>
			<tr>
				<th>Applet</th>
				<th>Cron</th>
				<th>Logs</th>
			</tr>
		</thead>
		<tbody>
			<!-- row 1 -->
			{#each rows as row}
				<tr>
					<td>{row.appletName}</td>
					<td>{explainCron(row.cron)}</td>
					<td
						><button
							class="btn btn-accent btn-xs"
							on:click={() => {
								shownLogs = row.logs;
								proxyLogsDialog.open();
							}}
						>
							Logs
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<ProxyLogsDialog bind:this={proxyLogsDialog} bind:logs={shownLogs} />
</div>
