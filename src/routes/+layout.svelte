<script lang="ts">
	import '../app.postcss';
	import { SvelteToast } from '@zerodevx/svelte-toast';
</script>

<slot />
<SvelteToast />

<style>
	:root {
		--toastContainerTop: auto;
		--toastContainerRight: auto;
		--toastContainerBottom: 4rem;
		--toastContainerLeft: calc(50vw - 8rem);
		--toastBarHeight: 0;
		--toastPadding: 0;
		--toastMsgPadding: 0;
		--toastBackground: transparent;
		--toastColor: transparent;
        --toastBoxShadow: none;
	}
</style>
