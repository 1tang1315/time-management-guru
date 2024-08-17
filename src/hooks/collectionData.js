import { collectionStore } from '@/store/index.js';
import { storeToRefs } from 'pinia';
import { getCollection, addCollection, getAllCollections, updateCollection } from '@/db/collections.js';

export const collectionData = () => {
  const store = collectionStore();
  const { addCollectionTodoPopup, currentCollection } = storeToRefs(store);

  const ChangeCurrentCollectionHandle = (obj) => {
    store.ChangeCurrentCollection(obj);
  }

  const getAllCollectionsHandle = async () => {
    try {
      return await getAllCollections();
    } catch (e) {
      alert(e.message);
    }
  }
  const getCollectionHandle = async (key) => { 
    try {
      return await getCollection(key);
    } catch (e) {
      alert(e.message);
    }
  }
  const updateCollectionHandle = async (obj) => { 
    try {
      await updateCollection(obj);
    } catch (e) {
      alert(e.message);
    }
  }
  const addCollectionHandle = async (obj) => { 
    try {
      await addCollection(obj);
    } catch (e) {
      alert(e.message);
    }
  }

  const updateCollectionTodoPopupHandle = (value) => {
    store.ChangeAddCollectionTodoPopup(value);
  }

  return {
    addCollectionTodoPopup,
    currentCollection,
    ChangeCurrentCollectionHandle,
    getCollectionHandle,
    getAllCollectionsHandle,
    addCollectionHandle,
    updateCollectionTodoPopupHandle,
    updateCollectionHandle
  }
}