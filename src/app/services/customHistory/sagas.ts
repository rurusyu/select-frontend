import { Actions } from 'app/services/customHistory';
import { RidiSelectState } from 'app/store';
import { replace, go, LOCATION_CHANGE } from 'connected-react-router';
import { all, call, put, select, take } from 'redux-saga/effects';
import { findUpperPathDiff, historyStackSessionStorageHelper } from './historyStack.helpers';

export function* watchLocationChange() {
  while (true) {
    yield take(LOCATION_CHANGE);
    const state: RidiSelectState = yield select(s => s);
    if (state.customHistory.historyStack.length === 0 && window.history.length > 0) {
      yield put(
        Actions.syncHistoryStack({
          location: state.router.location,
          stack: historyStackSessionStorageHelper.getStack(),
        }),
      );
    } else {
      yield put(
        Actions.syncHistoryStack({
          location: state.router.location,
        }),
      );
    }
  }
}

export function* watchSyncHistoryStack() {
  while (true) {
    yield take(Actions.syncHistoryStack.getType());
    const state: RidiSelectState = yield select(s => s);
    yield call(historyStackSessionStorageHelper.saveStack, state.customHistory.historyStack);
  }
}

export function* watchNavigateUp() {
  while (true) {
    yield take(Actions.navigateUp.getType());
    const state: RidiSelectState = yield select(s => s);
    const { historyStack } = state.customHistory;
    const upperPathDiff = findUpperPathDiff(historyStack);
    if (upperPathDiff === -1 && historyStack.length === 1) {
      yield put(replace('/'));
    } else {
      yield put(go(upperPathDiff));
    }
  }
}

export function* customHistorySaga() {
  yield all([watchLocationChange(), watchSyncHistoryStack(), watchNavigateUp()]);
}
