export type CharacterSheetTab =
  | 'core-stats'
  | 'combat'
  | 'spellcasting'
  | 'features-equipment';

function createUiStore() {
  let activeTab = $state<CharacterSheetTab>('core-stats');
  let isEditMode = $state(false);
  let hpDialogOpen = $state(false);

  return {
    get activeTab() { return activeTab; },
    get isEditMode() { return isEditMode; },
    get hpDialogOpen() { return hpDialogOpen; },

    setActiveTab(tab: CharacterSheetTab): void {
      activeTab = tab;
    },
    toggleEditMode(): void {
      isEditMode = !isEditMode;
    },
    setHpDialogOpen(open: boolean): void {
      hpDialogOpen = open;
    },
  };
}

export const uiStore = createUiStore();
