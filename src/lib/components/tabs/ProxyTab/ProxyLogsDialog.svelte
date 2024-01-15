<script lang="ts">
	import type { ExecutionPerscriptionLog } from 'xtreamly_sdk';

	export let logs: ExecutionPerscriptionLog[];
	export let opened = false;

	export function open() {
		const modal = document.getElementById('proxy_logs_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = true;
			modal.onclose = () => {
				opened = false;
			};
			modal.showModal();
		}
	}

	export function close() {
		const modal = document.getElementById('proxy_logs_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = false;
			modal.close();
		}
	}
</script>

<dialog id="proxy_logs_modal" class="modal">
	<form method="dialog" class="modal-box">
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
		<h3 class="font-bold text-lg">Logs</h3>
		<div class="flex flex-col py-4 gap-2">
			{#each logs.slice(-10) as log}
				<div class="w-full flex flex-row items-center">
					<div class="w-20 font-light text-xs">
						{log.dateTime.toLocaleString()}
					</div>
					<div class="flex-1 text-xs">
						{log.message}: {log.metaData}
					</div>
				</div>
                <div class="divider h-1 my-1"></div>
			{/each}
		</div>
		<!-- TODO: Add download log button -->
	</form>
</dialog>

<style>
	form {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	form::-webkit-scrollbar {
		width: 0;
		height: 0;
	}
</style>
