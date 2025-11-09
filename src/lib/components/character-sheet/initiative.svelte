<script lang="ts">

    let { initiative, onChange } = $props<{
        initiative?: string;
        onChange?: (data: { initiative: string }) => void;
    }>();

    let localInitiative = $state(initiative);

    $effect(() => {
        if (onChange) {
            onChange({ initiative: localInitiative });
        }
    });

</script>

<style>
.initiative-frame {
  width: 4.5rem;
  height: 5.2rem;
  background: var(--tw-prose-invert-bg, #fff);
  border: 2px solid var(--tw-prose-invert-borders, #d1d5db);
  border-radius: 0.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.04);
  margin: 0 auto;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
}
.initiative-input {
  width: 2.5rem;
  height: 2.2rem;
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
  border: none;
  background: transparent;
  outline: none;
  color: var(--tw-prose-invert-title, #111827);
  letter-spacing: 0.02em;
  margin-bottom: 0.2rem;
}
.initiative-label {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  color: var(--tw-prose-invert-muted, #6b7280);
  margin-top: 0.2rem;
}
</style>

<div class="initiative-frame">
  <input
    class="initiative-input"
    type="text"
    inputmode="numeric"
    pattern="-?[0-9]*"
    bind:value={localInitiative}
    min="-99"
    max="99"
    aria-label="Initiative"
  />
  <span class="initiative-label">Initiative</span>
</div>
