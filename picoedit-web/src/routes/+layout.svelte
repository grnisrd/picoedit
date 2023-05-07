<script lang="ts">
  import '../app.css'
  import Icon from '@iconify/svelte'
</script>

<header class="flex items-center bg-yellow-400 p-2">
  <b class="text-xl">picoedit</b>
  <nav class="flex gap-2 ml-auto">
    <a href="https://example.com">Sandbox</a>
    <a href="https://example.com">Source</a>
  </nav>
</header>

<slot />

<style lang="postcss">
  nav a {
    @apply flex gap-0.5 items-center underline font-bold;

    &:hover {
      @apply no-underline;
    }

    &::after {
      @apply block translate-y-0.5;
      content: url('data:image/svg+xml,%3Csvg xmlns="http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg" width="16" height="16" viewBox="0 0 16 16"%3E%3Cpath fill="currentColor" d="M7 2.75A.75.75 0 0 1 7.75 2h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V4.56l-9.22 9.22a.75.75 0 0 1-1.06-1.06l9.22-9.22H7.75A.75.75 0 0 1 7 2.75Z"%2F%3E%3C%2Fsvg%3E');
    }
  }
</style>
