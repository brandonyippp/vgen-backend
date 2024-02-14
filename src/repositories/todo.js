export default (db) => {
  const { TODO_COLLECTION } = process.env;
  const collection = db.collection(TODO_COLLECTION);

  async function insertOne(todo) {
    return await collection.insertOne(todo);
  }

  const findAll = async (userID) => {
    return await collection.find({ userID: userID });
  };

  return {
    insertOne,
    findAll,
  };
};
