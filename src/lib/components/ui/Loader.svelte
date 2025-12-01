<script lang="ts">
  interface Props {
    size?: 'sm' | 'md' | 'lg';
  }

  let { size = 'md' }: Props = $props();
</script>

<div class="page-loader">
  <div class="loader-spinner loader-spinner--{size}"></div>
</div>
