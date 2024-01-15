<script lang="ts">
    // NOTE: We can use a single dialog instead of id_suffixing
	import type { ExecutionPerscriptionLog, ProxyAddresses } from 'xtreamly_sdk';

	export let addresses: ProxyAddresses;
	export let opened = false;

    export let id_suffix: string

	export function open() {
		const modal = document.getElementById(`proxy_secrets_modal_${id_suffix}`);
		if (modal instanceof HTMLDialogElement) {
			opened = true;
			modal.onclose = () => {
				opened = false;
			};
			modal.showModal();
		}
	}

	export function close() {
		const modal = document.getElementById(`proxy_secrets_modal_${id_suffix}`);
		if (modal instanceof HTMLDialogElement) {
			opened = false;
			modal.close();
		}
	}
</script>

<dialog id={`proxy_secrets_modal_${id_suffix}`} class="modal">
	<form method="dialog" class="modal-box">
		<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
		<h3 class="font-bold text-lg">Addresses</h3>
		<ul class="py-4">
			{#each Object.entries(addresses) as chain}
				{#if chain[0] === 'evm'}
					<li>
						<h3 class="font-semibold">
							{chain[0].toUpperCase()}
						</h3>
                        <h4 class="my-2">Private Key:</h4>
						<p class="text-xs whitespace-break-spaces border rounded-lg p-4 my-2 break-all">
							{chain[1].privateKey}
						</p>
                        <h4 class="my-2">Public Key:</h4>
						<p class="text-xs whitespace-break-spaces border rounded-lg p-4 my-2 break-all">
							{chain[1].publicAddress}
						</p>
					</li>
				{/if}
			{/each}
		</ul>
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
