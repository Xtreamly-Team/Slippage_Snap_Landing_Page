<script lang="ts">
	import xtreamly_logo from '$lib/assets/xtreamly_logo.png';
	import xtreamly_logo_white from '$lib/assets/xtreamly_logo_white.png';
	import { BACKEND_ADDRESS } from '$lib/utils';
	import { Authenticator, MetamaskHandler } from 'xtreamly_sdk';

	type InitializationState = 'none' | 'metamask' | 'opened' | 'error';
	type CardState = 'disabled' | 'ready' | 'done';

	let appState: InitializationState = 'none';

	$: metamaskCardState = getMetamaskCardState(appState);
	$: xtreamlyCardState = getXtreamlyCardState(appState);

	function getMetamaskCardState(appState: InitializationState): CardState {
		switch (appState) {
			case 'none':
				return 'ready';
			case 'metamask':
				// return 'done';
				return 'disabled';
			case 'opened':
				// return 'done';
				return 'disabled';
			case 'error':
				return 'disabled';
		}
	}

	function getXtreamlyCardState(appState: InitializationState): CardState {
        console.warn(appState);
		switch (appState) {
			case 'none':
				return 'disabled';
			case 'metamask':
				return 'ready';
			case 'opened':
				// return 'done';
				return 'disabled';
			case 'error':
				return 'disabled';
		}
	}

	const metamaskHandler = new MetamaskHandler();

	const authenticator = new Authenticator(BACKEND_ADDRESS);

	async function openPopUpClickHandler() {
		console.log(`opening popup`);
		let url = `auth`;
		if (await authenticator.isLoggedIn()) {
			url = `control`;
		}

		const popup = window.open(
			url,
			undefined,
			`height=550, left=1635, top=170, status=no, width=350, titlebar=no, toolbar=no, menubar=no, popup`
		);

        appState = 'opened';
	}

	const getCardClass = (cardState: CardState) => {
		console.log(cardState);
		switch (cardState) {
			case 'disabled':
				return 'btn-accent';
			case 'ready':
				return 'btn-primary';
			case 'done':
				return 'btn-success';
		}
	};

    function metamaskCardButtonLabel(appState: InitializationState) {
        switch (appState) {
            case 'none':
                return 'Connect';
            case 'metamask':
                return 'Connected';
            case 'opened':
                return 'Connected';
            case 'error':
                return 'Error';
        }
	};


    function xtreamlyCardButtonLabel(appState: InitializationState) {
        switch (appState) {
            case 'none':
                return 'Open Xtreamly';
            case 'metamask':
                return 'Open Xtreamly';
            case 'error':
                return 'Open Xtreamly';
            case 'opened':
                return 'Opened';
        }
	};
</script>

<svelte:head>
	<title>Xtreamly</title>
	<link
		rel="icon"
		href="https://www.gitbook.com/cdn-cgi/image/width=40,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F3001788566-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FssWXZ6ySl0mrYIAVmLjq%252Ficon%252FQPE0NacB3sAo4zgvg2Tz%252FXtreamly.jpg%3Falt%3Dmedia%26token%3Dc6b77943-f21c-40d2-b8d4-867f38a319f3"
	/>
	<link
		rel="shortcut icon"
		href="https://www.gitbook.com/cdn-cgi/image/width=40,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F3001788566-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FssWXZ6ySl0mrYIAVmLjq%252Ficon%252FQPE0NacB3sAo4zgvg2Tz%252FXtreamly.jpg%3Falt%3Dmedia%26token%3Dc6b77943-f21c-40d2-b8d4-867f38a319f3"
	/>
</svelte:head>

<div class="w-full h-screen bg-gray-100 flex items-center justify-center">
	<div
		class="container bg-gray-100 w-full max-w-5xl h-full md:h-1/2 rounded-xl
        mx-4 flex flex-wrap px-5 pt-5 pb-3.5 flex-row
        items-center gap-4 justify-evenly"
	>
		<div class="card w-80 h-[32rem] bg-base-100 shadow-xl">
			<figure>
				<img
					class="p-12 w-72"
					src="https://altcoinsbox.com/wp-content/uploads/2023/03/metamask-logo.webp"
					alt="Metamask"
				/>
			</figure>
			<div class="card-body">
				<h2 class="card-title justify-center">Metamask</h2>
				<p class="text-center">Connect your metamask</p>
				<div class="card-actions justify-end">
					<button
                        disabled={metamaskCardState === "disabled"}
						class="w-full btn {getCardClass(metamaskCardState
						)}"
						on:click={async () => {
                            if (appState === 'metamask' || appState === 'opened') {
                                return;
                            }
							let res = await metamaskHandler.connectAndGetAccounts();

							if (res && res.length > 0) {
								const account = res[0];
								appState = 'metamask';
							}
						}}>{metamaskCardButtonLabel(appState)}</button
					>
				</div>
			</div>
		</div>
		<div class="card w-80 h-[32rem] bg-base-100 shadow-xl">
			<figure>
				<img class="p-12 w-72" src={xtreamly_logo_white} alt="Xtreamly" />
			</figure>
			<div class="card-body">
				<h2 class="card-title justify-center">Xtreamly</h2>
				<p class="text-center">Open control panel</p>
				<div class="card-actions justify-end">
					<button
                        disabled={xtreamlyCardState === "disabled"}
						class="w-full btn {getCardClass(xtreamlyCardState
						)}"
						on:click={async () => {
							await openPopUpClickHandler();
						}}>{xtreamlyCardButtonLabel(appState)}</button
					>
				</div>
			</div>
		</div>
	</div>
</div>
