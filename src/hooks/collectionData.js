import { collectionStore } from '@/store/index.js';
import { storeToRefs } from 'pinia';

export const collectionData = () => {
  const store = collectionStore();
  const { addCollectionTodoPopup, currentCollection } = storeToRefs(store);

  const ChangeCurrentCollectionHandle = (obj) => {
    store.ChangeCurrentCollection(obj);
  }
  

  const updateCollectionTodoPopupHandle = (value) => {
    store.ChangeAddCollectionTodoPopup(value);
  }

  return {
    addCollectionTodoPopup,
    currentCollection,
    ChangeCurrentCollectionHandle,
    updateCollectionTodoPopupHandle,
  }
}