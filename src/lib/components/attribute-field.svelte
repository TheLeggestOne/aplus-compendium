<script lang="ts">
  let {label, value, subValue} = $props();
</script>

<div class="attribute-field">
  <div class="value-row">
    <div class="primary">{value}</div>
    {#if subValue !== "" && subValue != null}
      <div class="secondary">{subValue}</div>
    {/if}
  </div>
  <div class="label">{label}</div>
</div>

<style>
  .attribute-field {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    font-family: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
  }

  .value-row {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
  }

  .value-row .primary {
    font-size: 1.6rem;
    font-weight: 700;
    color: #0f172a;
  }

  .value-row .secondary {
    font-size: 0.95rem;
    font-weight: 500;
    color: #475467;
  }

  .label {
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #6b7280;
  }
</style>