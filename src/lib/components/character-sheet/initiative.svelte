<script lang="ts">
import { Input } from "../ui/input";
import { useDebouncedChange } from "./utilities/useDebouncedChange";

const { initiative = "0", onChange } = $props<{
  initiative?: string;
  onChange?: (data: { initiative: string }) => void;
}>();

let localInitiative = $state(initiative);
const emitChange = useDebouncedChange(onChange, 800);

$effect(() => {
  if (emitChange) emitChange({ initiative: localInitiative });
});

$effect(() => {
  if (initiative !== localInitiative) {
    localInitiative = initiative;
  }
});

function updateInitiative(value: string) {
  // Allow empty string for editing, clamp to -99 to 99 on blur
  if (/^-?\d{0,2}$/.test(value) || value === "") {
    localInitiative = value;
  }
}
function commitInitiative() {
  let value = localInitiative;
  if (value !== "") {
    let num = Math.floor(Number(value));
    num = Math.max(-99, Math.min(99, isNaN(num) ? 0 : num));
    localInitiative = String(num);
  }
}
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
  <Input
    class="initiative-input"
    type="text"
    inputmode="numeric"
    pattern="-?[0-9]*"
    value={localInitiative}
    oninput={(e) => updateInitiative((e.target as HTMLInputElement).value)}
    onblur={commitInitiative}
    min="-99"
    max="99"
    aria-label="Initiative"
  />
  <span class="initiative-label">Initiative</span>
</div>
