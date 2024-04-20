<script lang="ts">
    import xtreamly_logo_white from "$lib/assets/xtreamly_logo_white.png";
    import { SnapAddress } from "$lib/constants";
    import { MetamaskHandler } from "$lib/metamask_handler";
    import { SnapClient } from "$lib/snap_client";


    type InitializationState = "none" | "metamask" | "installed" | "error";
    type CardState = "disabled" | "ready" | "done";

    let appState: InitializationState = "none";

    $: metamaskCardState = getMetamaskCardState(appState);
    $: xtreamlyCardState = getXtreamlyCardState(appState);

    function getMetamaskCardState(appState: InitializationState): CardState {
        switch (appState) {
            case "none":
                return "ready";
            case "metamask":
                // return 'done';
                return "disabled";
            case "installed":
                // return 'done';
                return "disabled";
            case "error":
                return "disabled";
        }
    }

    function getXtreamlyCardState(appState: InitializationState): CardState {
        console.warn(appState);
        switch (appState) {
            case "none":
                return "disabled";
            case "metamask":
                return "ready";
            case "installed":
                // return 'done';
                return "disabled";
            case "error":
                return "disabled";
        }
    }

    async function openSnapClickHandler() {
        console.log(`opening snap`);
        console.log(await snapClient.getSnaps());
        // console.log(await snapClient.connectToSnap('local:http://localhost:8080'))
        console.log(await snapClient.connectToSnap(SnapAddress));
        console.log("Connected");
        appState = "installed";
    }

    const getCardClass = (cardState: CardState) => {
        console.log(cardState);
        switch (cardState) {
            case "disabled":
                return "btn-accent";
            case "ready":
                return "btn-primary";
            case "done":
                return "btn-success";
        }
    };

    function metamaskCardButtonLabel(appState: InitializationState) {
        switch (appState) {
            case "none":
                return "Connect";
            case "metamask":
                return "Connected";
            case "installed":
                return "Connected";
            case "error":
                return "Metamask Not Found";
        }
    }

    function xtreamlyCardButtonLabel(appState: InitializationState) {
        switch (appState) {
            case "none":
                return "Install Snap";
            case "metamask":
                return "Install Snap";
            case "error":
                return "Install Snap";
            case "installed":
                return "Installed";
        }
    }

    let metamaskAvailable = true
    let metamaskHandler: MetamaskHandler
    let snapClient: SnapClient

    try {
    metamaskHandler = new MetamaskHandler();
    snapClient = new SnapClient();
    } catch {
        metamaskAvailable = false;
        appState = 'error'
    }

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
    <div class="xl:w-1/2 lg:w-2/3 flex flex-col items-center justify-center">
    <div
        class="container bg-gray-100 w-full max-w-5xl h-full md:h-1/2 rounded-xl
        flex flex-wrap pt-5 pb-3.5 flex-row
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
                        class="w-full btn {getCardClass(metamaskCardState)}"
                        on:click={async () => {
                            if (
                                appState === "metamask" ||
                                appState === "installed"
                            ) {
                                return;
                            }
                            let res = await metamaskHandler.initialize();

                            if (res && res.length > 0) {
                                const account = res[0];
                                // if ((await snapClient)
                                const installedSnaps =
                                    await snapClient.getSnaps();
                                console.log(installedSnaps)
                                console.log(Object.keys(installedSnaps))
                                if (
                                    Object.keys(installedSnaps).includes(SnapAddress)
                                ) {
                                    appState = "installed";
                                    
                                } else {
                                    appState = "metamask";
                                }
                                console.log(appState)
                            }
                        }}>{metamaskCardButtonLabel(appState)}</button
                    >
                </div>
            </div>
        </div>
        <div class="card w-80 h-[32rem] bg-base-100 shadow-xl">
            <figure>
                <img
                    class="p-12 w-72"
                    src={xtreamly_logo_white}
                    alt="Xtreamly"
                />
            </figure>
            <div class="card-body">
                <h2 class="card-title justify-center">Xtreamly</h2>
                <p class="text-center">Install Slippage Predictor Snap</p>
                <div class="card-actions justify-end">
                    <button
                        disabled={xtreamlyCardState === "disabled"}
                        class="w-full btn {getCardClass(xtreamlyCardState)}"
                        on:click={async () => {
                            await openSnapClickHandler();
                        }}>{xtreamlyCardButtonLabel(appState)}</button
                    >
                </div>
            </div>
        </div>
    </div>
                <div class="h-4"/>
        <div class="mx-12 card bg-base-100 shadow-xl">
            <div class="card-body">
                <h2 class="card-title justify-start">Description</h2>
                <p class="">Xtreamly slippage prediction snap provides insights and predicts slippage amount on DeX swaps. Currently works on ETH/USDT and ETH/USDC pairs on Uniswap V3.</p>
                <a href="https://info.xtreamly.io/xtreamly/product/snaps-user-guide" class="font-bold link-info text-start justify-center">Starting Guide and FAQ</a>
                <div class="h-4"/>
                <h2 class="card-title justify-start">Support</h2>
                <p class="text-start">Email: info@xtreamly.io</p>
            </div>
        </div>
        </div>
</div>
