<script lang="ts">
    let { speed, onChange } = $props<{
        speed?: string;
        onChange?: (data: { speed: string }) => void;
    }>();

    let localSpeed = $state(speed ?? "");

    $effect(() => {
        if (localSpeed !== speed) {
            localSpeed = speed;
        }
    });
</script>

<!-- svelte-ignore css_unused_selector -->
<style>
.speed-frame {
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
.speed-input {
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
.speed-label {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  color: var(--tw-prose-invert-muted, #6b7280);
  margin-top: 0.2rem;
}
</style>

<div class="speed-frame">
  <input
    class="speed-input"
    type="text"
    inputmode="numeric"
    pattern="-?[0-9]*"
    bind:value={localSpeed}
    aria-label="Speed"
  />
  <span class="speed-label">Speed</span>
</div>
