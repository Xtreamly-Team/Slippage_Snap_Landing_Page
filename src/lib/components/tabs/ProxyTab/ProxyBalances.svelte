<script lang="ts">
	// TODO: Why doesn't tranfer work but approve does
	import type { Balance } from '$lib/utils';
	import { onMount } from 'svelte';
	import { ContractType, EVMHandler, ProxyAccount } from 'xtreamly_sdk';

	import ProxyChargeDialog from './ProxyChargeDialog.svelte';

	let evmHandler: EVMHandler;
	export let rows: Balance[];

	export let proxyAddress: string;

	let proxyChargeDialog: ProxyChargeDialog;

	let selectedActionInCharge: 'Charge' | 'Approve';
	let selectedBalanceInCharge: Balance | null = null;

	// We could have used the realAccount stored in the store but since we need the evmHandler anyway, it doesn't matter.
	let realAccount = '';
	onMount(async () => {
		evmHandler = new EVMHandler();
		await evmHandler.initialize(undefined, undefined, window.ethereum);
		realAccount = await evmHandler.getAccountAddress();
	});
</script>

<div class="w-full overflow-x-auto">
	<table class="table table-xs">
		<!-- head -->
		<thead>
			<tr>
				<th>Coin</th>
				<th>Balance</th>
				<th>Delegated</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td>{row.coin}</td>
					<td>
						<div class="flex flex-row items-center justify-between">
							{row.balance}
							<button
								class="btn btn-accent btn-xs btn-circle"
								on:click={async () => {
									selectedActionInCharge = 'Charge';
									selectedBalanceInCharge = row;
									proxyChargeDialog.open();
								}}
							>
								+
							</button>
						</div>
					</td>
					<td>
						<div class="flex flex-row items-center justify-between">
							{row.delegated}
							<button
								class="btn btn-accent btn-xs btn-circle"
								on:click={async () => {
									selectedActionInCharge = 'Approve';
									selectedBalanceInCharge = row;
									proxyChargeDialog.open();
								}}
							>
								+
							</button>
						</div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<ProxyChargeDialog
	bind:this={proxyChargeDialog}
	{selectedActionInCharge}
	{selectedBalanceInCharge}
	{evmHandler}
	{proxyAddress}
/>
