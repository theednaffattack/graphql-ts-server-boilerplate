export const deleteUsersAfterTestsRun = async (user: any, connection: any) => {
  await connection.manager.remove(user);
};

export const clearDb = async (connection: any) => {
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const repository = await connection.getRepository(entity.name);
    await repository.query(`DELETE FROM ${entity.tableName};`);
  }
};
