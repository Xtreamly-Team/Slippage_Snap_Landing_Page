<script lang="ts">
	import Toast from '$lib/components/Toast.svelte';
	import { showToast, type Balance } from '$lib/utils';
	import { ContractType, EVMHandler } from 'xtreamly_sdk';

	export let evmHandler: EVMHandler;
	export let proxyAddress: string;
	export let opened = false;
	export let selectedActionInCharge: 'Charge' | 'Approve';
	export let selectedBalanceInCharge: Balance | null;
	let amount: number;
	export function open() {
		const modal = document.getElementById('proxy_charge_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = true;
			modal.onclose = () => {
				opened = false;
			};
			modal.showModal();
		}
	}

	export function close() {
		const modal = document.getElementById('proxy_charge_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = false;
			modal.close();
		}
	}

	async function confirm() {
		if (selectedBalanceInCharge) {
			const contract = evmHandler.getContract(ContractType.ERC20, selectedBalanceInCharge.contract);
			switch (selectedActionInCharge) {
				case 'Charge':
					try {
						console.warn(contract);
						let tx = await evmHandler.transferERC20(
							contract,
							proxyAddress,
							BigInt(`${amount * 1000000}`)
						);
						await tx.wait();
					} catch (error) {
						console.error(error);
						showToast(Toast, {
							toastType: 'error',
							// TODO: Is invalid opcode: INVALID correct code?
							message: `Insufficient funds`
						});
					}
					break;
				case 'Approve':
					try {
						console.warn(contract);
						const tx2 = await evmHandler.approveTransferERC20(
							contract,
							proxyAddress,
							BigInt(`${amount * 1000000}`)
						);
						await tx2.wait();
					} catch (error) {
						console.error(error);
						showToast(Toast, {
							toastType: 'error',
							// TODO: Is invalid opcode: INVALID correct code?
							message: `Error approving transfer`
						});
					}
					break;
			}
		}
	}
</script>

<dialog id="proxy_charge_modal" class="modal">
	{#if selectedBalanceInCharge}
		<form method="dialog" class="modal-box">
			<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
			<h3 class="font-bold text-lg my-1">{selectedActionInCharge}</h3>
			<div class="flex flex-row w-full items-center gap-2">
				<input
					type="number"
					step="any"
					placeholder={`Amount`}
					class="input input-sm input-bordered w-full max-w-xs my-1"
					bind:value={amount}
				/>
				<label>
					{`${selectedBalanceInCharge.coin}`}
				</label>
			</div>
			<div class="flex flex-row w-full">
				<button
					class="btn w-full btn-sm btn-primary my-1"
					on:click={async () => {
						await confirm();
					}}>Confirm</button
				>
			</div>
		</form>
	{/if}
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
