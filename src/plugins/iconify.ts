import { addCollection } from '@iconify/vue/offline';
import { offlineIconCollections } from './iconify-offline-icons';

/** Setup the iconify offline */
export function setupIconifyOffline() {
  offlineIconCollections.forEach(collection => {
    addCollection(collection);
  });
}
