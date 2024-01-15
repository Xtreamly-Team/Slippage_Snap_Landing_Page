<script lang="ts">
	import Toast from '$lib/components/Toast.svelte';
	import { BACKEND_ADDRESS, showToast } from '$lib/utils';
	import { AppletVisibility, Authenticator, publishApplet } from 'xtreamly_sdk';
	import { BackendHandler } from 'xtreamly_sdk/src/backend';

	let editorOpen = false;
	export let opened = false;

    export let onSuccess: () => Promise<void>;

	const authenticator = new Authenticator(BACKEND_ADDRESS);
	const backendHandler = new BackendHandler(BACKEND_ADDRESS, authenticator.getAuthToken() ?? '');

	export function open() {
		const modal = document.getElementById('create_applet_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = true;
			modal.onclose = async () => {
				opened = false;
			};
			modal.showModal();
		}
	}

	export function close() {
		const modal = document.getElementById('create_applet_modal');
		if (modal instanceof HTMLDialogElement) {
			opened = false;
			modal.close();
		}
	}

	function openEditor() {
		console.log(`opening popup`);
		let url = `editor`;
		const popup = window.open(
			url,
			'_blank',
			// TODO: Should this be popup or window?
			`popup`
		);
		if (popup) {
			editorOpen = true;
			popup.window.onmessage = async function (e) {
				console.log('EVENT');
				console.log(e);
				if (e.data.from === 'editor') {
					console.log(`Edited`);
					console.log(e.data.code);
					addAppletCode = e.data.code;
				}
			};
			popup.window.addEventListener('load', () => {
				popup.window.addEventListener('unload', async () => {
					await onEditorClosed();
				});
			});
		}
	}

	async function onEditorClosed() {
		console.log('Editor Closed');
		editorOpen = false;
	}

	let addAppletPublic = false;

	let addAppletRating = '3.7';
	let addAppletInstallNotes = '';
	let addAppletUninstallNotes = '';
	let addAppletUpdates = 'No Updates';

	let addAppletDialogName = '';
	let addAppletDialogDeveloper = '';
	let addAppletDialogUrl = '';
	let addAppletDialogLogoUrl = '';
	let addAppletDialogDescription = '';
	let addAppletDialogShortDescription = '';
	let addAppletCode = '';

	function resetAddAppletDialogFields() {
		addAppletDialogName = '';
		addAppletCode = '';
		addAppletDialogDeveloper = '';
		addAppletDialogUrl = '';
		addAppletDialogLogoUrl = '';
		addAppletDialogDescription = '';
		addAppletDialogShortDescription = '';
		addAppletRating = '3.7';
		addAppletUpdates = 'No Updates';
		addAppletInstallNotes = '';
		addAppletUninstallNotes = '';
		addAppletPublic = false;
	}

	async function codeButtonClickHandler() {
		openEditor();
	}

	async function createButtonClickHandler() {
		const res = await publishApplet(
			backendHandler,
			addAppletDialogName,
			addAppletCode,
			addAppletDialogDeveloper,
			addAppletDialogUrl,
			addAppletDialogLogoUrl,
			addAppletDialogDescription,
			addAppletDialogShortDescription,
			addAppletRating,
			addAppletUpdates,
			addAppletInstallNotes,
			addAppletUninstallNotes,
			addAppletPublic ? AppletVisibility.PUBLIC : AppletVisibility.PRIVATE
		);
		console.log(res);
		if (res) {
			resetAddAppletDialogFields();
			showToast(Toast, { toastType: 'success', message: 'Applet created successfully!' });
			close();
            await onSuccess();
		}
	}
</script>

<dialog id="create_applet_modal" class="modal">
	{#if editorOpen}
		<div
			class="w-full h-screen bg-base-100 z-[100] flex flex-col items-center
                        justify-center
                        px-2"
		>
			<div class="mx-auto my-auto text-blue-800 font-light">Close the editor to continue</div>
		</div>
	{:else}
		<form method="dialog" class="modal-box overflow-y-scroll">
			<button
				class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
				on:click={() => {
					resetAddAppletDialogFields();
				}}>✕</button
			>
			<h3 class="font-bold text-lg">Create Applet</h3>
			<!-- Replace this with dropdown -->
			<div class="py-2 flex flex-col gap-2">
				<label class="mr-auto label cursor-pointer flex flex-row space-x-2">
					<span class="label-text font-light">{addAppletPublic ? 'Public' : 'Private'}</span>
					<input type="checkbox" class="toggle toggle-primary" bind:checked={addAppletPublic} />
				</label>
				<input
					type="text"
					placeholder="Name"
					class="input input-sm input-bordered w-full max-w-xs"
					bind:value={addAppletDialogName}
				/>
				{#if addAppletPublic}
					<input
						type="text"
						placeholder="Developer"
						class="input input-sm input-bordered w-full max-w-xs"
						bind:value={addAppletDialogDeveloper}
					/>
				{/if}

				{#if addAppletPublic}
					<input
						type="text"
						placeholder="Logo Url"
						class="input input-sm input-bordered w-full max-w-xs"
						bind:value={addAppletDialogLogoUrl}
					/>
				{/if}
				<input
					type="text"
					placeholder="Description"
					class="input input-sm input-bordered w-full max-w-xs"
					bind:value={addAppletDialogDescription}
				/>
			</div>
			<div class="flex flex-row ml-auto gap-1 my-1">
				<button class="btn w-1/2 btn-sm btn-primary" on:click={codeButtonClickHandler}
					>{addAppletCode ? 'Edit Code' : 'Code'}</button
				>
				<button
					disabled={addAppletCode === ''}
					class="btn w-1/2 btn-sm btn-primary"
					on:click={createButtonClickHandler}>Create</button
				>
			</div>
		</form>
	{/if}

	<form method="dialog" class="modal-backdrop">
		<button>close</button>
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
