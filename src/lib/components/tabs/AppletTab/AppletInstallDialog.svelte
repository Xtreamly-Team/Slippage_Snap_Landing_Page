<script lang="ts">
	// TODO: Check Different cron string compatibilities
	// TODO: Round the specified cron numbers if user inserts float
	import { generateCron, type IntervalUnit } from 'xtreamly_sdk';
	import type { Writable } from 'svelte/store';

	import { Applet, Authenticator, installApplet } from 'xtreamly_sdk';
	import { BackendError, BackendHandler } from 'xtreamly_sdk/src/backend';
	import { type ProxyAccount, ExecutionStatus, createProxy, getProxies } from 'xtreamly_sdk';

	import { getContext } from 'svelte';

	import { BACKEND_ADDRESS, showToast } from '$lib/utils';
	import Toast from '$lib/components/Toast.svelte';

	const authenticator = new Authenticator(BACKEND_ADDRESS);
	const backendHandler = new BackendHandler(BACKEND_ADDRESS, authenticator.getAuthToken() ?? '');
	let inputCronString = '';

	const proxies = getContext<Writable<ProxyAccount[]>>('proxies');

	let selectedProxyId = '';
	export let selectedApplet: Applet;

	$: runningProxies = $proxies.filter((pr) => pr.status === ExecutionStatus.RUNNING);
	$: stoppedProxies = $proxies.filter((pr) => pr.status === ExecutionStatus.STOPPED);
	$: selectedProxy = $proxies.filter((pr) => pr.uid === selectedProxyId)[0];

	export let opened = false;

	export function open() {
		const modal = document.getElementById('install_applet_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = true;
			modal.onclose = () => {
				opened = false;
			};
			modal.showModal();
		}
	}

	export function close() {
		const modal = document.getElementById('install_applet_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = false;
			modal.close();
		}
	}

	let useRawCron = false;

	let intervalUnits: IntervalUnit[] = ['seconds', 'minutes', 'hours', 'days'];

	let selectedInterval = 1;
	let selectedIntervalUnit: IntervalUnit = 'minutes';

	export let successfullInstall = false;

	async function installAppletButtonClickHandler() {
		console.log('INSTALLING');
		const cronString = useRawCron
			? inputCronString
			: generateCron(selectedInterval, selectedIntervalUnit);
		// Check if cron string is valid
		// TODO: Create a better validator
		if (!cronString || cronString.split(' ').length !== 6) {
			console.error('Invalid cron string');
			console.error(cronString);
			return;
		}
		try {
			const res = await installApplet(
				backendHandler,
				selectedApplet.uid,
				selectedProxyId,
				cronString
			);
			successfullInstall = true;
			close();
			showToast(Toast, {
				toastType: 'success',
				message: `Applet installed successfully in ${selectedProxy.name}`
			});
		} catch (e) {
			if ((e.message as string).includes('already installed')) {
                close()
				showToast(Toast, {
					toastType: 'error',
					message: `Can't install applet. Already installed in ${selectedProxy.name}`
				});
			}
		}
	}
</script>

<dialog id="install_applet_modal" class="modal">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<form method="dialog" class="modal-box" on:click|stopPropagation|preventDefault={() => {}}>
		<button
			class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
			on:click|stopPropagation={() => {}}>✕</button
		>
		<h3 class="font-bold text-lg">Install Applet</h3>
		<!-- Replace this with dropdown -->
		<div class="py-2 flex flex-col gap-2 z-90">
			<select
				class="select select-sm select-secondary w-full max-w-xs font-light"
				on:click|stopPropagation={(e) => {}}
				on:change|preventDefault|stopPropagation={(e) => {
					selectedProxyId = e.target.value;
				}}
			>
				<option disabled selected>Pick proxy account</option>
				{#each runningProxies as proxy}
					<option value={proxy.uid}>{proxy.name}</option>
				{/each}
				{#each stoppedProxies as proxy}
					<option disabled value={proxy.uid}>{`${proxy.name} [Stopped]`}</option>
				{/each}
			</select>
			<div class="w-full flex flex-col h-[72px]">
				<div class="w-full flex flex-row justify-between my-2">
					<h4 class="font-semibold text-md">Run</h4>
				</div>
				{#if !useRawCron}
					<div class="w-full flex flex-row gap-2">
						<label class="label text-sm">Every</label>
						<input
							type="number"
							step="1"
							placeholder="Interval"
							on:click|preventDefault|stopPropagation={(e) => {}}
							class="input input-sm input-bordered w-full max-w-xs"
							bind:value={selectedInterval}
						/>
						<select
							class="select select-sm select-secondary font-light"
							on:click|stopPropagation={(e) => {}}
							on:change|preventDefault|stopPropagation={(e) => {
								selectedIntervalUnit = e.target.value;
							}}
						>
							<option disabled selected>Interval</option>
							{#each intervalUnits as unit}
								<option value={unit}>{unit}</option>
							{/each}
						</select>
					</div>
				{/if}
				{#if useRawCron}
					<input
						type="text"
						placeholder="Cron String"
						on:click|stopPropagation={(e) => {}}
						class="input input-sm input-bordered w-full max-w-xs"
						bind:value={inputCronString}
					/>
				{/if}
			</div>
			<div class="flex flex-row my-2">
				<span class="label-text">Use cron string</span>
				<input
					type="checkbox"
					class="checkbox mx-2"
					bind:checked={useRawCron}
					on:click|stopPropagation={() => {}}
				/>
			</div>
		</div>
		<div class="w-full flex flex-row justify-end">
			<button class="w-full btn btn-sm btn-primary" on:click={installAppletButtonClickHandler}
				>Install</button
			>
		</div>
	</form>

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
	</form>
</dialog>
