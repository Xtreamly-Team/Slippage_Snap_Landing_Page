<script lang="ts">
	import { Authenticator } from 'xtreamly_sdk';
	import { BackendHandler } from 'xtreamly_sdk/src/backend';
	import { installApplet } from 'xtreamly_sdk';
	import type { Applet, ProxyAccount } from 'xtreamly_sdk';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { BACKEND_ADDRESS } from '$lib/utils';

	import sample_logo from '$lib/assets/sample_logo.svg';
	import AppletInstallDialog from './AppletInstallDialog.svelte';

	const authenticator = new Authenticator(BACKEND_ADDRESS);

	export let app: Applet;

	export let selectedAppId: string;

	const proxies = getContext<Writable<ProxyAccount[]>>('proxies');

	let inputCronString = '';
	let selectedProxyIdInInstallModal = '';
	const backendHandler = new BackendHandler(BACKEND_ADDRESS, authenticator.getAuthToken() ?? '');
	let installAppletModal: AppletInstallDialog;

	let modalOpened = false;
</script>

<!-- Fix Row Layout -->

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="w-full h-24 flex flex-row mx-2 items-center rounded-md opacity-75 space-x-2 px-4"
	on:click|preventDefault={() => {
		selectedAppId = app.uid;
	}}
>
	<img
		class="w-12 h-12 object-fill mr-2 rounded-lg"
		src={app.logoUrl}
		alt="App Logo"
		on:error={(ev) => {
			ev.target.src = sample_logo;
		}}
	/>

	<div class="w-full flex flex-col">
		<div class="w-full flex flex-row items-center">
			<div class="h-20 flex flex-col my-2 justify-center mr-2">
				<span class="text-[15px] font-light text-black">{app.name}</span>
				<!-- <p class="text-xs text-gray-500">{app.shortDescription.slice(0, 12)}</p> -->
				<div class="flex flex-row space-x-2 items-center mt-1">
					<div class="rating rating-sm">
						<input type="radio" name="rating-1" class="mask mask-star" />
						<input type="radio" name="rating-1" class="mask mask-star" />
						<input type="radio" name="rating-1" class="mask mask-star" />
						<input type="radio" name="rating-1" class="mask mask-star" />
						<input type="radio" name="rating-1" class="mask mask-star" checked />
					</div>
					<p class="text-xs text-gray-500">{app.rating}</p>
				</div>
			</div>
			<button
				class="btn btn-xs w-14 btn-accent text-primary rounded-2xl z-10 ml-auto mr-2"
				on:click|stopPropagation={() => {
					installAppletModal.open();
				}}>Get</button
			>
			<AppletInstallDialog
				bind:this={installAppletModal}
				bind:opened={modalOpened}
				selectedApplet={app}
			/>
			<!-- <AppletInstallDialog selectedApplet={app} /> -->
		</div>

		<div class="h-[1px] w-full bg-gray-300" />
	</div>
</div>
