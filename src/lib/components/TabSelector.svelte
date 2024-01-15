<script lang="ts">
    export let activeTab: string
</script>

<div class="sticky top-0 bg-base-100 z-30  w-full tabs">
	<a
		class="tab w-1/2 tab-lifted font-light {activeTab === 'Proxies-Tab' ? 'tab-active' : ''}"
		on:click={() => {
			activeTab = 'Proxies-Tab';
		}}>Proxies</a
	>
	<a
		class="tab w-1/2 tab-lifted font-light {activeTab === 'Applet-Tab' ? 'tab-active' : ''}"
		on:click={() => {
			activeTab = 'Applet-Tab';
		}}>Applets</a
	>
</div>
