import AplusDataSource from "src/lib/orm/data-source";
import { UserEntity } from "./entity";

const entityManager = AplusDataSource.createEntityManager();

const userRepository = {
  getAllUsersAsync: async () => {
    return await entityManager.find(UserEntity);
  },
  getUserByIdAsync: async (id: string) => {
    return await entityManager.findOneBy(UserEntity, {
      id: id,
    });
  },
  getUserByEmailAsync: async (email: string) => {
    return await entityManager.findOneBy(UserEntity, {
      email: email,
    });
  },
  upsertUserAsync: async (user) => {
    return await entityManager.save(user);
  },
  deleteUserAsync: async (id) => {
    return await entityManager.delete(UserEntity, {
      id: id,
    });
  },
};
export default {
  userRepository,
};
