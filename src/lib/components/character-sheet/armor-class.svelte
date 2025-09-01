<script lang="ts">
import { Input } from "../ui/input";
import { useDebouncedChange } from "./utilities/useDebouncedChange";

const { armorClass = "10", onChange } = $props<{
  armorClass?: string;
  onChange?: (data: { armorClass: string }) => void;
}>();

let localAC = $state(armorClass);

$effect(() => {
  if (armorClass !== localAC) {
    localAC = armorClass;
  }
});

const emitChange = useDebouncedChange(onChange, 800);

$effect(() => {
  if (emitChange) emitChange({ ac: localAC });
});

function updateAC(value: string) {
  // Allow empty string for editing, clamp to 1-99 on blur
  if (value === "" || /^\d{0,2}$/.test(value)) {
    localAC = value;
  }
}
function commitAC() {
  let value = localAC;
  if (value !== "") {
    let num = Math.floor(Math.abs(Number(value)));
    num = Number(String(num).replace(/^0+/, ""));
    num = Math.max(1, Math.min(99, isNaN(num) ? 10 : num));
    localAC = String(num);
  }
}
</script>


<!-- svelte-ignore css_unused_selector -->
<style>
.ac-frame {
  width: 5rem;
  height: 6rem;
  background: var(--tw-prose-invert-bg, #fff);
  border: 2px solid var(--tw-prose-invert-borders, #d1d5db);
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  border-bottom-left-radius: 2rem;
  border-bottom-right-radius: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.04);
  margin: 0 auto;
  padding: 0.5rem 0.5rem 1rem 0.5rem;
}
.ac-input {
  width: 3rem;
  height: 2.5rem;
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  border: none;
  background: transparent;
  outline: none;
  color: var(--tw-prose-invert-title, #111827);
  letter-spacing: 0.02em;
  margin-bottom: 0.2rem;
}
.ac-label {
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  color: var(--tw-prose-invert-muted, #6b7280);
  margin-top: 0.2rem;
}
</style>

<div class="ac-frame">
  <Input
    class="ac-input"
    type="text"
    inputmode="numeric"
    pattern="[0-9]*"
    value={localAC}
    oninput={(e) => updateAC((e.target as HTMLInputElement).value)}
    onblur={commitAC}
    min="1"
    max="99"
    aria-label="Armor Class"
  />
  <span class="ac-label">Armor Class</span>
</div>
