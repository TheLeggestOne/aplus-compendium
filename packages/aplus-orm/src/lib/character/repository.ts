import AplusDataSource from "src/lib/orm/data-source";
import { CharacterEntity } from "./entity";

const entityManager = AplusDataSource.createEntityManager();

const characterRepository = {
  getAllCharactersAsync: async () => {
    return await entityManager.find(CharacterEntity);
  },
  getCharacterByIdAsync: async (id: string) => {
    return await entityManager.findOneBy(CharacterEntity, { id });
  },
  upsertCharacterAsync: async (character: CharacterEntity) => {
    return await entityManager.save(character);
  },
  deleteCharacterAsync: async (id: string) => {
    return await entityManager.delete(CharacterEntity, { id });
  },
};

export default {
  characterRepository,
};
