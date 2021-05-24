// 네이버 계정 데이터 주고받는 용도
let req_naver_account_store = { data: {} };
let res_naver_account_store = { status: '', err: '', data: {} };
let req_naver_account_load = { data: {} };
let res_naver_account_load = { status: '', err: '', data: {} };

// 쿠팡 파트너스 API 데이터
let req_coupang_api_store = { data: {} };
let res_coupang_api_store = { status: '', err: '', data: {} };
let req_coupang_api_load = { data: {} };
let res_coupang_api_load = { status: '', err: '', data: {} };

module.exports = {
  req_naver_account_store,
  res_naver_account_store,
  req_naver_account_load,
  res_naver_account_load,
  req_coupang_api_store,
  res_coupang_api_store,
  req_coupang_api_load,
  res_coupang_api_load
};