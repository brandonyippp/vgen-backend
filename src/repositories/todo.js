export default (db) => {
  const { TODO_COLLECTION } = process.env;
  const collection = db.collection(TODO_COLLECTION);

  async function insertOne(todo) {
    return await collection.insertOne(todo);
  }

  const find = async (userID) => {
    return await collection.find({ userID: userID });
  };

  const updateOne = async (userID, todoID, completed) => {
    return await collection.updateOne(
      { userID, todoID },
      { $set: { completed } }
    );
  };

  return {
    insertOne,
    find,
    updateOne,
  };
};
