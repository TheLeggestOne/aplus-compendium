<script lang="ts">
  export let label = "";
  export let value = "";
</script>

<div class="underline-field">
  <div class="value">{value}</div>
  <div class="line" aria-hidden="true"></div>
  <div class="label">{label}</div>
</div>

<style>
  .underline-field {
    display: inline-flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
    font-family: "Inter", "Plus Jakarta Sans", system-ui, sans-serif;
  }

  .underline-field .value {
    font-weight: 600;
    font-size: 1rem;
    color: #111827;
  }

  .underline-field .line {
    width: 100%;
    border-bottom: 1px solid rgba(15, 23, 42, 0.25);
  }

  .underline-field .label {
    font-size: 0.65rem;
    color: #6b7280;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
</style>