import { all, call, select, takeLatest } from 'redux-saga/effects';

import { RoutePaths } from 'app/constants';
import { Actions } from 'app/services/voucher';
import { requestUseVoucher, UseVoucherResponseCode } from 'app/services/voucher/requests';
import { RidiSelectState } from 'app/store';
import toast from 'app/utils/toast';

export function* useVoucher({ payload }: ReturnType<typeof Actions.useVoucher>) {
  const { voucherCode } = payload;
  const state: RidiSelectState = yield select((s) => s);
  try {
    yield call(requestUseVoucher, voucherCode);
    window.location.replace(RoutePaths.HOME);
  } catch (e) {
    if (!e.response || !e.response.data) {
      return;
    }

    const { code } = e.response.data;
    if (code === UseVoucherResponseCode.subscriptionRequiredVoucher) {
      window.location.href = `${state.environment.STORE_URL}/select/payments?voucher_code=${voucherCode}`;
      return;
    }

    let failureMessage = '이용권 등록에 실패했습니다. 이용권 코드를 확인해주세요.';
    switch (code) {
      case UseVoucherResponseCode.redeemedVoucher:
        failureMessage = '이미 등록된 이용권입니다.';
        break;
      case UseVoucherResponseCode.deactivatedVoucher:
        failureMessage = '등록할 수 없는 이용권입니다.';
        break;
      case UseVoucherResponseCode.oneTimeRedeemableVoucher:
        failureMessage = 'ID당 1회만 사용할 수 있도록 제한된 이용권입니다.';
        break;
      case UseVoucherResponseCode.expiredVoucher:
        failureMessage = '유효기간이 만료된 이용권입니다.';
        break;
      case UseVoucherResponseCode.voucherNotFound:
        failureMessage = '잘못된 이용권 코드입니다. 이용권 코드를 확인해주세요.';
        break;
      case UseVoucherResponseCode.voucherProviderInerworkingFailed:
        failureMessage = `이용권 등록에 실패했습니다.\n쇼핑몰에서 구매하신 이용권의 경우 일시적으로 연동 실패가 발생하고 있습니다. (2019.12.24. 12:00~)\n불편을 드려 죄송합니다.`;
        break;
    }
    toast.failureMessage(failureMessage);
  }
}

export function* watchUseVoucher() {
  yield takeLatest(Actions.useVoucher.getType(), useVoucher);
}

export function* voucherRootSaga() {
  yield all([
    watchUseVoucher(),
  ]);
}
