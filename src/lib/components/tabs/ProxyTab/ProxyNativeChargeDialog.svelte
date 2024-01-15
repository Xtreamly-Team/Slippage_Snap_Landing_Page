<script lang="ts">
	import Toast from '$lib/components/Toast.svelte';
	import { showToast, type Balance, type NativeBalance } from '$lib/utils';
	import { ContractType, EVMHandler } from 'xtreamly_sdk';

	export let evmHandler: EVMHandler;
	export let proxyAddress: string;
	export let opened = false;
	export let selectedBalanceInCharge: NativeBalance | null;
	let amount: number;
	export function open() {
		const modal = document.getElementById('proxy_native_charge_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = true;
			modal.onclose = () => {
				opened = false;
			};
			modal.showModal();
		}
	}

	export function close() {
		const modal = document.getElementById('proxy_native_charge_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = false;
			modal.close();
		}
	}

	async function confirm() {
        // const currentAccount = (await metamaskHandler.connectAndGetAccounts())[0]

		if (selectedBalanceInCharge) {
			try {
                let baseAmount = Math.round(1000000 * +(amount.toFixed(6)))
                let transferAmount = `${baseAmount}000000000000`
				let tx = await evmHandler.transferNative(proxyAddress, BigInt(transferAmount));
				await tx.wait();
                // TODO: Add success toast
			} catch (error) {
				console.warn(error.message);
                if (error.message.includes('insufficient funds')) {
                    showToast(Toast, {
                        toastType: 'error',
                        message: `Insufficient funds`
                    });
                } else if (error.message.includes('user rejected transaction')) {
                    showToast(Toast, {
                        toastType: 'error',
                        message: `Transaction rejected`
                    });
                } else {
                    showToast(Toast, {
                        toastType: 'error',
                        message: `Unknown error`
                    });
                }
			}
		}
	}
</script>

<dialog id="proxy_native_charge_modal" class="modal">
	{#if selectedBalanceInCharge}
		<form method="dialog" class="modal-box">
			<button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
			<h3 class="font-bold text-lg my-1">Charge</h3>
			<div class="flex flex-row w-full items-center gap-2">
				<input
					type="number"
					step="0.001"
					placeholder={`Amount`}
					class="input input-sm input-bordered w-full max-w-xs my-1"
					bind:value={amount}
				/>
				<label>
					{`${selectedBalanceInCharge.name}`}
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
