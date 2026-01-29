<script lang="ts">
    let {label, value, tone= "default" } = $props();
</script>

<div class={`number-field ${tone}`}>
  <div class="value">{value}</div>
  <div class="label">{label}</div>
</div>

<style>
  .number-field {
    display: inline-flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: center;
    text-align: center;
    font-family: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
  }

  .number-field .value {
    font-size: 1.4rem;
    font-weight: 700;
    color: #0f172a;
  }

  .number-field.muted .value {
    color: #475467;
  }

  .number-field .label {
    font-size: 0.65rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #6b7280;
  }
</style>