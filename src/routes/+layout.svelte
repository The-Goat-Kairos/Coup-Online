<script lang="ts">
	import './layout.css';
	import devd from '$lib/assets/Developed-By-Humans-Not-By-AI-Badge-white.svg';
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col">
    {@render children()}

    <div class="flex flex-grow"> </div>

    <footer class="pt-3 mb-3">
        <img class="mx-auto block no-download" src={devd} alt="Written By Human, Not By AI" />
    </footer>
</div>
