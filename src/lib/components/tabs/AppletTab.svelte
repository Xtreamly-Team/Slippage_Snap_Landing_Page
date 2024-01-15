<script lang="ts">
	// TODO: Reset add applet dialog on close in every situation
	import { Applet, AppletVisibility } from 'xtreamly_sdk';
	import type { Writable } from 'svelte/store';
	import { getContext, onMount } from 'svelte';
	import {
		Authenticator,
		publishApplet,
		getPublicApplets,
		getMyApplets,
		getMyExecutionPerscriptions,
		getPerscriptionLogs
	} from 'xtreamly_sdk';
	import { BACKEND_ADDRESS } from '$lib/utils';
	import { BackendHandler } from 'xtreamly_sdk/src/backend';
	import AppletDetail from './AppletTab/AppletDetail.svelte';
	import AppletControlRow from './AppletTab/AppletControlRow.svelte';
	import { Icon } from 'svelte-awesome';
	import { faAdd, faPlus, faRefresh } from '@fortawesome/free-solid-svg-icons';
	import AppletCreateDialog from './AppletTab/AppletCreateDialog.svelte';
	import Toast from '../Toast.svelte';

	const authenticator = new Authenticator(BACKEND_ADDRESS);

	const privateApplets = getContext<Writable<Applet[]>>('privateApplets');
	const publicApplets = getContext<Writable<Applet[]>>('publicApplets');

	$: publicAppletsReversed = $publicApplets.reverse();
	$: privateAppletsReversed = $privateApplets;

	// $: allApplets = [...$privateApplets.reverse(), ...$publicApplets.reverse()];

	let selectedAppId = '';
	export let onlyShowMyApplets: boolean;

	const backendHandler = new BackendHandler(BACKEND_ADDRESS, authenticator.getAuthToken() ?? '');

	let refreshingApplets = false;
	const refreshAppletList = async () => {
		refreshingApplets = true;
		const receivedPublicApplets = await getPublicApplets(backendHandler);
		publicApplets.set(receivedPublicApplets);
		const receivedMyApplets = await getMyApplets(backendHandler);
		privateApplets.set(receivedMyApplets);
		refreshingApplets = false;
	};

	let refreshIconDisableTurning = false;

	onMount(async () => {
		refreshIconDisableTurning = true;
		await refreshAppletList();
		refreshIconDisableTurning = false;
	});

	let appletCreateDialog: AppletCreateDialog;
</script>

<div class="w-full flex flex-col items-center min-h-[23rem]">
	{#if selectedAppId}
		<AppletDetail bind:selectedAppId />
	{:else}
		<div
			class="sticky top-8 z-20 bg-base-100 drop-shadow-md shadow-gray-300 h-12 w-full flex flex-row items-center gap-1 px-4"
		>
			<label class="w-40 mr-auto label cursor-pointer flex flex-row space-x-2">
				<span class="label-text font-light"
					>{onlyShowMyApplets ? 'My Applets' : 'Public Applets'}</span
				>
				<input type="checkbox" class="toggle toggle-primary" bind:checked={onlyShowMyApplets} />
			</label>
			<div class="flex flex-row ml-auto">
				<button
					class="m-2"
					on:click={async () => {
						await refreshAppletList();
					}}
				>
					<Icon
						data={faRefresh}
						scale={1.2}
						spin={refreshingApplets && !refreshIconDisableTurning}
						class="text-sm text-primary cursor-pointer"
					/>
				</button>

				<button
					class="m-2"
					on:click={async () => {
						// await refreshAppletList();
						appletCreateDialog.open();
					}}
				>
					<Icon data={faPlus} scale={1.2} class="text-sm text-primary cursor-pointer" />
				</button>
			</div>
		</div>
		<!-- <div class="h-[1px] w-full bg-gray-300" /> -->
		<div class="w-full flex flex-col items-center">
			{#if refreshingApplets}
				<div class="w-full h-[22rem] flex flex-row justify-center">
					<span class="my-auto loading loading-dots loading-lg text-secondary" />
				</div>
			{:else if onlyShowMyApplets}
				{#each privateAppletsReversed as applet}
					<AppletControlRow app={applet} bind:selectedAppId />
				{/each}

				{#if privateAppletsReversed.length == 0}
					<div class="flex flex-col items-center justify-center h-[22rem]">
						<p class="text-gray-500 font-light text-sm">No applets found</p>
					</div>
				{/if}
			{:else}
				{#each publicAppletsReversed as applet}
					<AppletControlRow app={applet} bind:selectedAppId />
				{/each}
				{#if publicAppletsReversed.length == 0}
					<div class="flex flex-col items-center justify-center h-[21rem]">
						<p class="text-gray-500 font-light text-sm">No applets found</p>
					</div>
				{/if}
			{/if}
		</div>
		<AppletCreateDialog bind:this={appletCreateDialog} onSuccess={refreshAppletList} />
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
