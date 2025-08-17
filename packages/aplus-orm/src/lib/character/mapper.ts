import { CharacterEntity } from "./entity";
import { CharacterDto } from "./dto";

export const toCharacterDto = (e: CharacterEntity): CharacterDto => ({
  id: e.id,
  name: e.name,
  level: e.level,
});
