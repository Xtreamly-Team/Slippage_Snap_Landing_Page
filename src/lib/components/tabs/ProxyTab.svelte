<script lang="ts">
	import type { Writable } from 'svelte/store';

	import { Authenticator } from 'xtreamly_sdk';
	import { BackendHandler } from 'xtreamly_sdk/src/backend';
	import { type ProxyAccount, ExecutionStatus, createProxy, getProxies } from 'xtreamly_sdk';

	import { getContext, onMount } from 'svelte';

	import ProxyDetail from './ProxyTab/ProxyDetail.svelte';
	import ProxyControlRow from './ProxyTab/ProxyControlRow.svelte';
	import { BACKEND_ADDRESS } from '$lib/utils';
	import { faPlus, faRefresh } from '@fortawesome/free-solid-svg-icons';
	import { Icon } from 'svelte-awesome';

	const authenticator = new Authenticator(BACKEND_ADDRESS);

	const proxies = getContext<Writable<ProxyAccount[]>>('proxies');

	// TODO: Retreive mnemonic by button

	let selectedProxyId = '';

	let beingAddedProxyName = '';

	$: runningProxies = $proxies.filter((pr) => pr.status === ExecutionStatus.RUNNING);
	$: stoppedProxies = $proxies.filter((pr) => pr.status === ExecutionStatus.STOPPED);

	// TODO: Add Error Handling
	const backendHandler = new BackendHandler(BACKEND_ADDRESS, authenticator.getAuthToken() ?? '');

	let refreshingProxies = false;

	export let onlyShowRunning: boolean;

    let refreshIconDisableTurning = false;

	const refreshProxyList = async () => {
		refreshingProxies = true;
		const receivedProxies = await getProxies(backendHandler);
		if (receivedProxies) {
			proxies.set(receivedProxies);
		}
		refreshingProxies = false;
	};

    onMount(async () => {
        refreshIconDisableTurning = true;
        await refreshProxyList();
        refreshIconDisableTurning = false;
    });
</script>

<div class="w-full flex flex-col items-center min-h-[23rem]">
	{#if selectedProxyId}
		<ProxyDetail bind:selectedProxyId />
	{:else}
		<div
			class="sticky top-8 z-20 bg-base-100 drop-shadow-md shadow-gray-300 h-12 w-full flex flex-row items-center gap-1 px-4"
		>
			<label class="mr-auto label cursor-pointer flex flex-row space-x-2">
				<span class="w-14 label-text font-light">{onlyShowRunning ? 'Running' : 'All'}</span>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={onlyShowRunning} />
			</label>
			<div class="flex flex-row ml-auto">
				<button
					class="m-2"
					on:click={async () => {
						await refreshProxyList();
					}}
				>
					<Icon
						data={faRefresh}
						scale={1.2}
						spin={refreshingProxies && !refreshIconDisableTurning}
						class="text-sm text-primary cursor-pointer"
					/>
				</button>

				<button
					class="m-2"
					on:click={async (e) => {
						e.stopPropagation();
						document.getElementById('add_proxy_modal').showModal();
					}}
				>
					<Icon data={faPlus} scale={1.2} class="text-sm text-primary cursor-pointer" />
				</button>
			</div>
		</div>
		<dialog id="add_proxy_modal" class="modal">
			<form method="dialog" class="modal-box">
				<h3 class="font-bold text-lg">Create Proxy</h3>
				<!-- Replace this with dropdown -->
				<div class="py-2 flex flex-col gap-2">
					<input
						type="text"
						placeholder="Proxy Name"
						class="input h-10 input-bordered w-full max-w-xs"
						bind:value={beingAddedProxyName}
					/>
				</div>
				<div class="flex flex-row">
					<button
						class="w-full btn btn-sm btn-primary ml-auto"
						on:click={async () => {
							await createProxy(backendHandler, beingAddedProxyName);
							await refreshProxyList();
						}}>Create</button
					>
				</div>
			</form>

			<form method="dialog" class="modal-backdrop">
				<button>close</button>
			</form>
		</dialog>
        <div class="w-full flex flex-col gap-2 my-4 px-4">
		{#if refreshingProxies}
			<div class="w-full h-[21rem] flex flex-row justify-center">
				<span class="my-auto loading loading-dots loading-lg text-secondary" />
			</div>
		{:else if onlyShowRunning}
			{#each runningProxies as proxy}
				<ProxyControlRow proxyId={proxy.uid} bind:selectedProxyId />
			{/each}
			{#if runningProxies.length == 0}
				<div class="flex flex-col items-center justify-center h-[21rem]">
					<p class="text-gray-500 font-light text-sm">No running proxy found</p>
				</div>
			{/if}
		{:else}
			{#each $proxies as proxy}
				<ProxyControlRow proxyId={proxy.uid} bind:selectedProxyId />
			{/each}
			{#if $proxies.length == 0}
				<div class="flex flex-col items-center justify-center h-[21rem]">
					<p class="text-gray-500 font-light text-sm">No proxy found</p>
				</div>
			{/if}
		{/if}
        </div>
	{/if}
</div>

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
