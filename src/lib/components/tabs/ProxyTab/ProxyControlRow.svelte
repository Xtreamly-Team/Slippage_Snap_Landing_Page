<script lang="ts">
	import { summerizeAddress, toggleProxy } from '$lib/utils';
	import { Authenticator, getProxyAddresses, type ProxyAddresses } from 'xtreamly_sdk';
	import { ExecutionStatus, SupportedChains, type ProxyAccount } from 'xtreamly_sdk';
	import { faInfo, faPause, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
	import { getContext, onMount } from 'svelte';
	import { Icon } from 'svelte-awesome';
	import type { Writable } from 'svelte/store';

	import { stopProxy, resumeProxy, getProxies } from 'xtreamly_sdk';
	import { BackendHandler } from 'xtreamly_sdk/src/backend';
	import { BACKEND_ADDRESS } from '$lib/utils';
	import ProxyAddressesDialog from './ProxyAddressesDialog.svelte';

	let proxyAddresses: ProxyAddresses = {
		evm: {
			privateKey: '',
			publicAddress: ''
		},
		bitcoin: {
			privateKey: '',
			publicAddress: ''
		},
		solana: {
			privateKey: '',
			publicAddress: ''
		}
	};

	async function getAddresses(): Promise<ProxyAddresses | null> {
		if (proxy) {
			const res = await getProxyAddresses(backendHandler, proxy.uid);
			return res;
		}
		return null;
	}

	const authenticator = new Authenticator(BACKEND_ADDRESS);

	export let selectedProxyId: string;
	export let proxyId: string;

	const proxies = getContext<Writable<ProxyAccount[]>>('proxies');

	const backendHandler = new BackendHandler(BACKEND_ADDRESS, authenticator.getAuthToken() ?? '');

	$: proxy = $proxies.find((e) => e.uid === proxyId);

	const refreshProxyList = async () => {
		const receivedProxies = (await getProxies(backendHandler)) ?? [];
		proxies.set(receivedProxies);
	};

	let proxyAddressesDialog: ProxyAddressesDialog;

	async function toggleProxyHandler(
		backendHandler: BackendHandler,
		proxy: ProxyAccount | undefined
	) {
		await toggleProxy(backendHandler, proxy);
		await refreshProxyList();
	}

	onMount(async () => {
		console.log('ON MOUNT');
		const res = await getAddresses();
		if (res) {
			proxyAddresses = res;
		}
	});
</script>

{#if proxy}
	<div
		class="w-full flex flex-col opacity-75"
		on:click={() => {
			if (proxy) {
				selectedProxyId = proxy.uid;
			}
		}}
		on:keypress={() => {
			if (proxy) {
				selectedProxyId = proxy.uid;
			}
		}}
	>
		<div class="w-full h-24 flex flex-row space-x-2 items-center px-4 border rounded-xl">
			<h1 class="text-sm mr-auto">{`${proxy.name}`}</h1>
				<button
					class="btn btn-xs btn-accent"
					on:click|stopPropagation={async () => {
						proxyAddressesDialog.open();
					}}
				>
					{summerizeAddress(proxyAddresses.evm.publicAddress)}
				</button>

            <div class="flex flex-col items-center p-1 gap-1">
                <button
                    class="btn btn-sm btn-circle bg-base-100
                    border border-gray-300
                    "
                    on:click|stopPropagation={async () => {
                        await toggleProxyHandler(backendHandler, proxy);
                    }}
                    >
                    <Icon
                        data={proxy.status === ExecutionStatus.RUNNING ? faStop : faPlay}
                        class="text-primary fa-thin"
                    />
                </button>
                <p class="text-sm"> {proxy.status === ExecutionStatus.RUNNING ? "Running" : "Stopped"} </p>
            </div>

		</div>
		<!-- <div class="h-[1px] w-full bg-gray-300" /> -->
	</div>
	<ProxyAddressesDialog
		id_suffix={proxyId}
		bind:this={proxyAddressesDialog}
		bind:addresses={proxyAddresses}
	/>
{/if}
