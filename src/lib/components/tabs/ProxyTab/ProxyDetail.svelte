<script lang="ts">
	// TODO: Add refresh animation
	import {
		ExecutionPerscriptionLog,
		getMyApplets,
		getPerscriptionLogs,
		type ProxyAddresses,
		getProxyAddresses,
		getProxies,
		SupportedChains,
		EVMHandler

	} from 'xtreamly_sdk';
	import { Authenticator, getPublicApplets, getMyExecutionPerscriptions } from 'xtreamly_sdk';
	import { Applet, ExecutionPerscription, ExecutionStatus, ProxyAccount } from 'xtreamly_sdk';
	import { faArrowsRotate, faChevronLeft, faStop } from '@fortawesome/free-solid-svg-icons';

	import { getContext, onMount } from 'svelte';
	import { Icon } from 'svelte-awesome';
	import type { Writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import { BackendHandler } from 'xtreamly_sdk/src/backend';
	import {
		BACKEND_ADDRESS,
		toggleProxy,
		type Balance,
		getContractBalanceAndAllowances,
        contractAddressesMap,
		type NativeBalance,
		getNativeBalances,

		getNetworkInfo

	} from '$lib/utils';
	import ProxyInstalledApplets from './ProxyInstalledApplets.svelte';
	import ProxyBalances from './ProxyBalances.svelte';
	import ProxyNativeBalances from './ProxyNativeBalances.svelte';

	const authenticator = new Authenticator(BACKEND_ADDRESS);

    const realAccount = getContext<Writable<string>>('realAccount');
	const proxies = getContext<Writable<ProxyAccount[]>>('proxies');
	const publicApplets = getContext<Writable<Applet[]>>('publicApplets');
	const privateApplets = getContext<Writable<Applet[]>>('privateApplets');

	$: allApplets = [...$privateApplets, ...$publicApplets].filter(
		(v, i, a) => a.findIndex((t) => t.uid === v.uid) === i
	);

	// const executions = getContext<Writable<ExecutionPerscription[]>>('executions');

	type ProxyExecutionPerscriptionLogs = Record<string, ExecutionPerscriptionLog[]>;

	let proxyEPs: ExecutionPerscription[] = [];

	let proxyEPLogs: ProxyExecutionPerscriptionLogs = {};

	export let selectedProxyId: string;

	const backendHandler = new BackendHandler(BACKEND_ADDRESS, authenticator.getAuthToken() ?? '');

	$: proxy = $proxies.find((e) => e.uid == selectedProxyId);

	$: installedAppletIdsOnThisProxy = proxyEPs
		.filter((pe) => pe.proxyAccountId === selectedProxyId)
		.map((pe) => pe.appletId);

	$: installedAppletsOnThisProxy = allApplets.filter((a) =>
		installedAppletIdsOnThisProxy.includes(a.uid)
	);

	function getAppletForEP(ep: ExecutionPerscription) {
		return allApplets.find((a) => a.uid === ep.appletId);
	}

    const evmHandler = new EVMHandler();

	onMount(async () => {
		console.log('ON MOUNT');
        await evmHandler.initialize(undefined, undefined, window.ethereum);
        console.warn(await getNetworkInfo(evmHandler))
		await refreshAppletsEpsAndLogs();
		const res = await getAddresses();
		if (res) {
			proxyAddresses = res;
		}
		await refreshBalances();
	});

	async function refreshAppletsEpsAndLogs() {
		const currentPublicApplets = await getPublicApplets(backendHandler);
		publicApplets.set(currentPublicApplets);
		const currentPrivateApplets = await getMyApplets(backendHandler);
		privateApplets.set(currentPrivateApplets);
		proxyEPs = await getMyExecutionPerscriptions(backendHandler);
		for (let pe of proxyEPs) {
			console.warn(pe);
			const logs = await getPerscriptionLogs(backendHandler, pe.uid);
			if (logs) {
				console.log(logs.map((e) => e.message));
				proxyEPLogs[pe.uid] = logs;
			}
		}
	}

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


	// TODO: Type this
	$: installedAppletRows = proxyEPs
		.filter((ep) => ep.proxyAccountId === selectedProxyId)
		.map((ep) => {
			const applet = getAppletForEP(ep)?.name ?? 'No Name';
			const logs = proxyEPLogs[ep.uid] ?? [];
			return {
				appletName: applet,
				cron: ep.cron,
				logs: logs
			};
		});

    $: if (installedAppletRows) {
        console.warn(installedAppletRows);
    }


	async function getAddresses(): Promise<ProxyAddresses | null> {
		if (proxy) {
			const res = await getProxyAddresses(backendHandler, proxy.uid);
			return res;
		}
		return null;
	}

	let balances: Balance[] = [];
	let nativeBalances: NativeBalance[] = [];


	async function refreshBalances() {
		if (proxy) {
			// const contractAddress = contractAddressesMap.values();
			const res = await getContractBalanceAndAllowances(
				evmHandler,
				// [...contractAddress],
				proxyAddresses.evm.publicAddress,
                $realAccount
			);
			balances = res;

			const res2 = await getNativeBalances(
				evmHandler,
				[proxyAddresses.evm.publicAddress],
				[SupportedChains.EVM]
			);

			nativeBalances = res2;
		}
	}
</script>

{#if selectedProxyId && proxy}
	<div
		transition:fly={{ duration: 200, x: '50vw', opacity: 0.5 }}
		class="w-full flex flex-col items-start px-4 mb-12"
	>
		<div class="w-full flex flex-row justify-start my-4">
			<button
				class="btn btn-xs text-primary bg-transparent border-transparent hover:bg-transparent hover:border-transparent"
				on:click={() => {
					selectedProxyId = '';
				}}
			>
				<Icon data={faChevronLeft} />
				Back
			</button>
		</div>
		<div class="flex flex-row items-center gap-2">
			{#if proxy.status === ExecutionStatus.RUNNING}
				<Icon data={faArrowsRotate} class="text-primary fa-thin" />
			{:else if proxy.status === ExecutionStatus.STOPPED}
				<Icon data={faStop} class="text-primary" />
			{/if}
			<h2>{proxy.status === ExecutionStatus.RUNNING ? 'Running' : 'Stopped'}</h2>
		</div>

		<div class="flex flex-row gap-2 my-2">
			<button
				class="btn btn-primary btn-xs"
				on:click={async () => {
					await toggleProxy(backendHandler, proxy);
					const receivedProxies = (await getProxies(backendHandler)) ?? [];
					proxies.set(receivedProxies);
				}}
			>
				{proxy.status === ExecutionStatus.RUNNING ? 'Stop' : 'Resume'}
			</button>
			<!-- <button class="btn btn-xs btn-primary">Remove</button> -->
			<button
				class="btn btn-xs btn-primary"
				on:click={async () => {
					await refreshBalances();
					await refreshAppletsEpsAndLogs();
				}}
			>
				Refresh
			</button>
		</div>
		<div class="divider mt-0" />
		<h2 class="my-1">Installed Applets</h2>
		<ProxyInstalledApplets rows={installedAppletRows} />
		<div class="divider" />
		<h2 class="my-1">Native Balances</h2>
		<ProxyNativeBalances
			rows={nativeBalances}
			proxyAddress={proxyAddresses?.evm.publicAddress || ''}
		/>
		<div class="divider" />
		<h2 class="my-1">ERC20 Balance & Delegation</h2>
		<ProxyBalances rows={balances} proxyAddress={proxyAddresses?.evm.publicAddress || ''} />
		<div class="h-6" />
	</div>
{/if}
