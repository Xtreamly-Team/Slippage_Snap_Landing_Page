<script lang="ts">
	import { fade, blur, fly, slide, scale, draw, crossfade } from 'svelte/transition';
	import { Icon } from 'svelte-awesome';
	import {
		faChevronLeft,
		faChevronRight,
		faEllipsis,
		faShare,
		faShareAlt,
		faArrowUpFromBracket
	} from '@fortawesome/free-solid-svg-icons';
	import { getContext } from 'svelte';

	import type { Writable } from 'svelte/store';
	import { Authenticator, installApplet } from 'xtreamly_sdk';
	import type { Applet, ProxyAccount } from 'xtreamly_sdk';
	import { BackendHandler } from 'xtreamly_sdk/src/backend';
	import { BACKEND_ADDRESS } from '$lib/utils';

	import sample_logo from '$lib/assets/sample_logo.svg';
	import AppletInstallDialog from './AppletInstallDialog.svelte';

	const authenticator = new Authenticator(BACKEND_ADDRESS);

	const publicApplets = getContext<Writable<Applet[]>>('publicApplets');
	const privateApplets = getContext<Writable<Applet[]>>('privateApplets');
	const proxies = getContext<Writable<ProxyAccount[]>>('proxies');

	export let selectedAppId: string;

    $: allApplets = [...$publicApplets, ...$privateApplets]

	$: selectedApp = allApplets.find((e) => e.uid == selectedAppId);

	let inputCronString = '';

	let selectedProxyIdInInstallModal = '';

	const backendHandler = new BackendHandler(BACKEND_ADDRESS, authenticator.getAuthToken() ?? '');

    let installAppletModal: AppletInstallDialog;
</script>

{#if selectedAppId && selectedApp}
	<div
		transition:fly={{ duration: 200, x: '50vw', opacity: 0.5 }}
		class="w-full flex flex-col items-start px-4"
	>
		<div class="w-full flex flex-row justify-start my-4">
			<button
				class="btn btn-xs text-blue-400 bg-transparent border-transparent hover:bg-transparent hover:border-transparent"
				on:click={() => {
					selectedAppId = '';
				}}
			>
				<Icon data={faChevronLeft} />
				Back
			</button>
		</div>

		<div class="w-full flex flex-row justify-start">
			<!-- TODO: Make logo urls to point to app store logo sizes (rounded corners) -->
			<img
				class="w-24 h-24 rounded-2xl"
				src={selectedApp.logoUrl}
				alt="Applet Logo"
				on:error={(ev) => {
					ev.target.src = sample_logo;
				}}
			/>
			<div class="flex flex-col mx-4 w-full">
				<span class="text-lg"> {selectedApp.name} </span>
				<!-- <span class="text-xs font-light text-gray-400"> {selectedApp.shortDescription} </span> -->
				<div class="flex flex-row mt-auto w-full">
					<button
						class="btn btn-xs w-16 btn-primary rounded-2xl"
						on:click={() => {
                            installAppletModal.open();
						}}>Get it</button
					>
					<AppletInstallDialog bind:this={installAppletModal} selectedApplet={selectedApp} />
				</div>
			</div>
		</div>
		<div class="w-full flex flex-row justify-start items-center gap-1 my-4">
			<span class="text-sm text-gray-500"> {selectedApp.rating}</span>
			<div class="rating rating-sm">
				<input type="radio" class="mask mask-star-2 bg-gray-500" disabled />
				<input type="radio" class="mask mask-star-2 bg-gray-500" disabled />
				<input type="radio" class="mask mask-star-2 bg-gray-500" disabled />
				<input type="radio" class="mask mask-star-2 bg-gray-500" checked />
				<input type="radio" class="mask mask-star-2 bg-gray-500" disabled />
			</div>
		</div>
		<div class="h-[1px] w-full my-0 bg-gray-300" />
		<p class="text-sm font-light my-4">{selectedApp.description}</p>
		<div class="w-full flex flex-row my-2">
			<div class="flex flex-col">
				<a
					href="http://{selectedApp.url}"
					target="_blank"
					class="text-sm font-light text-blue-700 me-auto"
				>
					{selectedApp.url}
				</a>
				<span class="text-xs font-extralight me-auto">{selectedApp.developer}</span>
			</div>
			<!-- TODO: Add ability to see all apps written by a developer. Plus more details about developer -->
			<!-- <button class="btn btn-xs text-gray-400 ms-auto"> -->
			<!-- 	<Icon data={faChevronRight} /> -->
			<!-- </button> -->
			<button
				class="h-6 text-blue-700 text-sm ms-auto font-light normal-case p-0"
				onclick="my_modal_3.showModal()">Show Code</button
			>
			<dialog id="my_modal_3" class="modal">
				<form method="dialog" class="modal-box">
					<button class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>
					<h3 class="font-bold text-lg">Code</h3>
					<p
						class="border-gray-300 border rounded-md p-2 my-2 text-xs font-light whitespace-break-spaces break-words"
					>
						{selectedApp.script}
					</p>
				</form>
			</dialog>
		</div>
		<div class="h-[1px] w-full my-2 bg-gray-300" />
		<h4 class="my-2">What's new</h4>
		<div class="w-full flex flex-row">
			<span class="text-sm font-light">{selectedApp.updates}</span>
		</div>
		<div class="py-4" />
	</div>
{/if}

<!-- <script></script> -->
