import React from 'react';
import { Link } from 'react-router-dom';

import '../../stylesheets/Main/index.css';

const axios = require('axios');
const { ipcRenderer } = window;
const { generateHmac } = require('modules/hmacGenerator.js');

const REQUEST_METHOD = 'GET';
const DOMAIN = 'https://api-gateway.coupang.com';
const URL = '/v2/providers/affiliate_open_api/apis/openapi/v1/';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      CATEGORY_LIST: [
        { ID: 1001, NAME: '여성패션' },
        { ID: 1002, NAME: '남성패션' },
        { ID: 1003, NAME: '베이비패션 (0~3세)' },
        { ID: 1004, NAME: '여아패션 (3세 이상)' },
        { ID: 1005, NAME: '남아패션 (3세 이상)' },
        { ID: 1006, NAME: '스포츠패션' },
        { ID: 1007, NAME: '신발' },
        { ID: 1008, NAME: '가방/잡화' },
        { ID: 1010, NAME: '뷰티' },
        { ID: 1011, NAME: '출산/유아동' },
        { ID: 1012, NAME: '식품' },
        { ID: 1013, NAME: '주방용품' },
        { ID: 1014, NAME: '생활용품' },
        { ID: 1015, NAME: '홈인테리어' },
        { ID: 1016, NAME: '가전디지털' },
        { ID: 1017, NAME: '스포츠/레저' },
        { ID: 1018, NAME: '자동차용품' },
        { ID: 1019, NAME: '도서/음반/DVD' },
        { ID: 1020, NAME: '완구/취미' },
        { ID: 1021, NAME: '문구/오피스' },
        { ID: 1024, NAME: '헬스/건강식품' },
        { ID: 1025, NAME: '국내여행' },
        { ID: 1026, NAME: '해외여행' },
        { ID: 1029, NAME: '반려동물용품' }
      ],
      LIMIT_LIST: [
        { LIMIT: '10', TEXT: '10개' },
        { LIMIT: '20', TEXT: '20개' },
        { LIMIT: '40', TEXT: '40개' },
        { LIMIT: '60', TEXT: '60개' },
        { LIMIT: '80', TEXT: '80개' },
        { LIMIT: '100', TEXT: '100개' },
      ],
      account: {
        NAVER_ID: '',
        NAVER_PASSWORD: ''
      },
      coupang_API: {
        access_key: '',
        secret_key: ''
      },
      content: {
        category_id: '1001',
        limit: '100',
      },
      data: {},
    };
    this.handleMessageClose = this.handleMessageClose.bind(this);
    this.handleRequestPosting = this.handleRequestPosting.bind(this);
    this.handleSelectedCategory = this.handleSelectedCategory.bind(this);
    this.handleSelectedLimitedCount = this.handleSelectedLimitedCount.bind(this);
  };

  getBestProductsData() {
    const ACCESS_KEY = this.state.coupang_API.access_key;
    const SECRET_KEY = this.state.coupang_API.secret_key;

    if (this.state.content.category_id && this.state.content.limit) {
      (async () => {
        const PRODUCT_ID = this.state.content.category_id;
        const LIMIT = this.state.content.limit;
        const PRODUCT_REQUEST_URL = `products/bestcategories/${PRODUCT_ID}?limit=${LIMIT}`;
        const authorization = generateHmac(REQUEST_METHOD, `${URL}${PRODUCT_REQUEST_URL}`, SECRET_KEY, ACCESS_KEY);
        axios.defaults.baseURL = `${DOMAIN}${URL}`;

        try {
          const response = await axios.request({
            method: 'GET',
            url: PRODUCT_REQUEST_URL,
            headers: { Authorization: authorization },
          });
          this.setState({ data: response.data });
        } catch (err) {
          console.log(err.response.data);
        }
      })();
    }
  };

  componentDidMount() {
    const account = this.state.account;
    const naverData = { id: localStorage.getItem('naverId'), pw: localStorage.getItem('naverPw') };
    if (!naverData.id && !naverData.pw) {
      ipcRenderer.send('request_naver_data_load_data', {});
      ipcRenderer.on('response_naver_data_load_data', (event, data) => {
        console.log('=== response_naver_data_load_data ===');
        console.log(data);

        if (data.status === 'success') {
          const dataset = { naverId: data.data.id, naverPw: data.data.pw };
          localStorage.setItem('naver_account', JSON.stringify(dataset));

          account.NAVER_ID = data.data.id;
          account.NAVER_PASSWORD = data.data.pw;
          this.setState({ account });
        } else {
          this.props.history.push('/settings');
        }
      });
    } else {
      account.NAVER_ID = naverData.id;
      account.NAVER_PASSWORD = naverData.pw;
      this.setState({ account });
    }

    const coupang_api = this.state.coupang_API;
    const coupangAPIData = { access_key: localStorage.getItem('access_key'), secret_key: localStorage.getItem('secret_key') };
    if (!coupangAPIData.access_key && !coupangAPIData.secret_key) {
      ipcRenderer.send('request_coupangapi_data_load_data', {});
      ipcRenderer.on('response_coupangapi_data_load_data', (event, data) => {
        console.log('=== response_coupangapi_data_load_data ===');
        console.log(data);

        if (data.status === 'success') {
          const dataset = { access_key: data.data.access_key, secret_key: data.data.secret_key };
          localStorage.setItem('coupang_apikey', JSON.stringify(dataset));

          coupang_api.access_key = data.data.access_key;
          coupang_api.secret_key = data.data.secret_key;
          this.setState({ coupang_api });
        } else {
          this.props.history.push('/settings');
        }
      });
    } else {
      coupang_api.access_key = coupangAPIData.access_key;
      coupang_api.secret_key = coupangAPIData.secret_key;
      this.setState({ coupang_api });

      this.getBestProductsData();
    }

    console.log('Main');
  };

  handleMessageClose(e) {
    e.target.parentElement.className = 'displaynone';
  };

  handleSelectedCategory(e) {
    const content = this.state.content;
    content.category_id = e.target.value;
    this.setState({ content });

    this.getBestProductsData();
  };

  handleSelectedLimitedCount(e) {
    const content = this.state.content;
    content.limit = e.target.value;
    this.setState({ content });

    this.getBestProductsData();
  };

  handleRequestPosting() {
    const data = {
      account: this.state.account,
      coupangAPI: this.state.coupang_API,
      content: this.state.content,
    }
    ipcRenderer.send('request_main_store_main_data', data);
  };

  render() {
    const categories = this.state.CATEGORY_LIST.map((PRODUCT, index) => <option key={index} value={PRODUCT.ID} defaultValue={this.state.content.category_id === PRODUCT.ID}>{PRODUCT.NAME}</option>);
    const limits = this.state.LIMIT_LIST.map((LIMIT, index) => <option key={index} value={LIMIT.LIMIT} defaultValue={this.state.content.limit === LIMIT.LIMIT}>{LIMIT.TEXT}</option>);
    let products;
    if (Object.keys(this.state.data).length > 0) {
      products = this.state.data.data.map((result, index) => <tr key={index} ><td>{index+1}</td><td>{result.categoryName}</td><td>{result.productName}</td><td>{result.productPrice}</td><td><img width="100px" src={result.productImage} alt={result.productName} /></td></tr>)
    }
    return (
      <div className="main_wrap">
        <div className="message_wrap">
          <div className="message"><Link to="/status" className="color_black">실적 정보를 확인 하실 수 있습니다.</Link><button onClick={this.handleMessageClose} className="btn_unset message_close_btn"></button></div>
        </div>
        <div>쿠팡 카테고리 선택</div>
        <p>본 상품은 카테고리별 베스트 상품이며, 최대 100개까지 노출됩니다.</p>
        <div>{this.state.errorMessage}</div>
        <select className="select"  onChange={this.handleSelectedCategory}>
          <option value="">카테고리 선택</option>
          {categories}
        </select>
        <select className="select" onChange={this.handleSelectedLimitedCount}>
          <option value="">최대개수 선택</option>
          {limits}
        </select>
        <button className="btn display_i_b" onClick={this.handleRequestPosting}>Click</button>
        <table className="text-center">
          <colgroup>
            <col width="3%" />
            <col width="5%"/>
            <col width="20%"/>
            <col width="5%"/>
            <col width="20%"/>
          </colgroup>
          <thead>
            <tr>
              <th>번호</th>
              <th>카테고리</th>
              <th>상품명</th>
              <th>가격</th>
              <th>이미지</th>
            </tr>
          </thead>
          <tbody>
            {products}
          </tbody>
        </table>
      </div>
    );
  };
};

export default Main;
