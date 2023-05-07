<script lang="ts" type="module">
  import picoedit from '@edit/index.js'

  import { onMount } from 'svelte'

  onMount(() => {
    picoedit.create(
      document.getElementById('code-editor'),
      'console.log("Hello world")'
    )
  })
</script>

<section class="p-8 m-8 bg-gray-100">
  <h1 class="text-xl mb-4">a small, performant general purpose text editor.</h1>
  <div class="mb-4">
    <b>picoedit</b> is a modern lightweight general purpose text editor that packs
    a punch despite its tiny size.
  </div>
  <ul class="list-disc ml-4 mb-4">
    <li>No dependencies.</li>
    <li>No reliance on stylesheets.</li>
    <li>Works in all modern browsers.</li>
    <li>Included support for over ? languages.</li>
  </ul>
  <div class="flex flex-col gap-2">
    <code>npm i picoedit</code>
  </div>
</section>

<div id="code-editor" class="px-4 w-[48rem] h-80" />

<style lang="postcss">
  code {
    @apply border p-4 bg-gray-200;
  }
</style>
