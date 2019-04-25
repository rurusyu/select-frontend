import { mapValues } from 'lodash-es';

import history from 'app/config/history';
import { FetchErrorFlag, RoutePaths } from 'app/constants';
import { Actions } from 'app/services/book';
import { BookOwnershipStatus, BookState, LegacyStaticBookState, LocalStorageStaticBookState, StaticBookState } from 'app/services/book';
import { BookDetailResponse, BookDetailResponseV1, BookDetailResponseV2, requestBookDetail, requestBookOwnership } from 'app/services/book/requests';
import { RidiSelectState } from 'app/store';
import toast from 'app/utils/toast';
import { all, call, fork, put, select, take } from 'redux-saga/effects';

const KEY_LOCAL_STORAGE = 'rs.books';
const booksLocalStorageManager = {
  load: (): LocalStorageStaticBookState => {
    const data = localStorage.getItem(KEY_LOCAL_STORAGE);
    if (!data) {
      return {};
    }
    return mapValues(JSON.parse(data), (book: LegacyStaticBookState) => {
      if (book.bookDetail && (book.bookDetail as BookDetailResponseV1).description) {
        (book.bookDetail as BookDetailResponseV2).introduction = (book.bookDetail as BookDetailResponseV1).description;
        delete (book.bookDetail as BookDetailResponseV1).description;
      }
      return book as StaticBookState;
    });
  },
  save: (state: BookState) => {
    const staticBookState: LocalStorageStaticBookState = Object
      .keys(state)
      .reduce((prev, bookId): LocalStorageStaticBookState => {
        const id = Number(bookId);
        prev[id] = {
          dominantColor: state[id].dominantColor,
          book: state[id].book,
          bookDetail: state[id].bookDetail,
        };
        return prev;
      }, {} as LocalStorageStaticBookState);
    try {
      localStorage.setItem(KEY_LOCAL_STORAGE, JSON.stringify(staticBookState));
    }  catch (e) {
      localStorage.removeItem(KEY_LOCAL_STORAGE);
    }
  },
};

function* initialSaga() {
  yield put(Actions.initializeBooks({
    staticBookState: booksLocalStorageManager.load(),
  }));
}

function* watchActionsToCache() {
  while (true) {
    yield take([
      Actions.updateBooks.getType(),
      Actions.loadBookDetailSuccess.getType(),
      Actions.updateDominantColor.getType(),
    ]);
    const books = yield select((state: RidiSelectState) => state.booksById);
    booksLocalStorageManager.save(books);
  }
}

export function* watchLoadBookDetail() {
  while (true) {
    const { payload: { bookId } }: ReturnType<typeof Actions.loadBookDetailRequest> = yield take(Actions.loadBookDetailRequest.getType());
    try {
      if (isNaN(bookId)) {
        throw FetchErrorFlag.UNEXPECTED_BOOK_ID;
      }
      const response: BookDetailResponse = yield call(requestBookDetail, bookId);
      if (response.seriesBooks && response.seriesBooks.length > 0) {
        yield put(Actions.updateBooks({
          books: response.seriesBooks,
        }));
      }
      yield put(Actions.loadBookDetailSuccess({
        bookId: response.id,
        bookDetail: response,
      }));
      if (String(bookId) !== String(response.id)) {
        history.replace(`/book/${response.id}`);
      }
    } catch (e) {
      if (e.response.status === 403 && e.response.code === 'BOOK_NOT_AVAILABLE') {
        history.replace(RoutePaths.NOT_AVAILABLE_BOOK);
      } else if (e === FetchErrorFlag.UNEXPECTED_BOOK_ID || e.response.status === 404) {
        toast.failureMessage('도서가 존재하지 않습니다.');
        history.replace('/home');
      } else {
        toast.failureMessage();
      }
      yield put(Actions.loadBookDetailFailure({
        bookId,
      }));
    }
  }
}

export function* watchLoadBookOwnership() {
  while (true) {
    const { payload: { bookId } }: ReturnType<typeof Actions.loadBookOwnershipRequest> = yield take(Actions.loadBookOwnershipRequest.getType());
    try {
      const response: BookOwnershipStatus  = yield call(requestBookOwnership, bookId);
      yield put(Actions.loadBookOwnershipSuccess({
        bookId,
        ownershipStatus: response,
      }));
    } catch (e) {
      yield put(Actions.loadBookOwnershipFailure({
        bookId,
      }));
    }
  }
}

export function* bookRootSaga() {
  yield fork(initialSaga);
  yield all([
    watchLoadBookDetail(),
    watchActionsToCache(),
    watchLoadBookOwnership(),
  ]);
}
