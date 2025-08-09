import AplusDataSource from "src/data-source";
import { User } from "src/entities/user";

const entityManager = AplusDataSource.createEntityManager();

async function GetAllUsersAsync() {
  return await entityManager.find(User);
}

async function GetUserByIdAsync(id: string) {
  return await entityManager.findOneBy(User, {
    id: id,
  });
}

async function UpsertUserAsync(user: User) {
  return await entityManager.save(user);
}

async function DeleteUserAsync(id: string) {
  return await entityManager.delete(User, {
    id: id,
  });
}

async function GetUserByEmailAsync(email: string) {
  return await entityManager.findOneBy(User, {
    email: email,
  });
}

export default {
  DeleteUserAsync,
  GetAllUsersAsync,
  GetUserByEmailAsync,
  GetUserByIdAsync,
  UpsertUserAsync,
};
