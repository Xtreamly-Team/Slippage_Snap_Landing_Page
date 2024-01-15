<script lang="ts">
	// TODO: Why doesn't tranfer work but approve does
	import type { Balance, NativeBalance } from '$lib/utils';
	import { onMount } from 'svelte';
	import { ContractType, EVMHandler, ProxyAccount } from 'xtreamly_sdk';

	import ProxyNativeChargeDialog from './ProxyNativeChargeDialog.svelte';

	let evmHandler: EVMHandler;
	export let rows: NativeBalance[];

	export let proxyAddress: string;

	let proxyChargeDialog: ProxyNativeChargeDialog

	let selectedActionInCharge: 'Charge' | 'Approve' | 'Native';
	let selectedBalanceInCharge: NativeBalance | null = null;

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
				<th>Currency</th>
				<th>Balance</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row}
				<tr>
					<td>{row.name}</td>
					<td>
						<div class="flex flex-row items-center justify-between">
							{row.balance}
							<button
								class="btn btn-accent btn-xs btn-circle"
								on:click={async () => {
									selectedBalanceInCharge = row;
									selectedActionInCharge = 'Native';
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
<ProxyNativeChargeDialog
	bind:this={proxyChargeDialog}
	{selectedBalanceInCharge}
	{evmHandler}
	{proxyAddress}
/>
