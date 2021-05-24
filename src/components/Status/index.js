import React from 'react';

// react date picker
import DatePicker from 'react-datepicker';

// react google chart
import Chart from 'react-google-charts';

// 순서 바꾸면 참사
import '../../stylesheets/Status/index.css';
import 'react-datepicker/dist/react-datepicker.css';

const axios = require('axios');
const { ipcRenderer } = window;
const { generateHmac } = require('modules/hmacGenerator.js');

const getFormatDate = (date) => {
  var year = date.getFullYear();              //yyyy
  var month = (1 + date.getMonth());          //M
  month = month >= 10 ? month : '0' + month;  //month 두자리로 저장
  var day = date.getDate();                   //d
  day = day >= 10 ? day : '0' + day;          //day 두자리로 저장
  return  year + '' + month + '' + day;       //'-' 추가하여 yyyy-mm-dd 형태 생성 가능
};

const ClicksInfoChart = (props) => {
  const isData = props.isData;
  const data = props.data;
  if (isData) {
    return (
      <Chart
        width={'810px'}
        height={'500px'}
        chartType="LineChart"
        loader={<div className="loading_wrap">클릭정보 로딩 중..</div>}
        data={data}
        options={{
          hAxis: {
            title: '날짜',
          },
          vAxis: {
            title: '클릭 수',
          },
          animation: {
            startup: true,
            easing: 'linear',
            duration: 1500,
          },
          backgroundColor: 'rgba(255, 255, 255, 0)',
        }}
        rootProps={{ 'data-testid': '1' }}
      />
    );
  }
  return <div className="color_b7 font_14">해당 정보가 존재하지 않습니다.</div>;
};

const OrdersDataTable = (props) => {
  const isData = props.isData;
  if (isData) {
    const data = props.data.map((item, index) => (
      <tr key={index}>
        <td>{item.date}</td>
        <td>{item.orderId}</td>
        <td>{item.productId}</td>
        <td>{item.productName}</td>
        <td>{item.quantity}</td>
        <td>{item.gmv}</td>
        <td>{item.commissionRate}</td>
        <td>{item.commission}</td>
      </tr>
    ));
    return (
      <table>
        <thead>
          <tr>
            <th>날짜</th>
            <th>주문 번호</th>
            <th>쿠팡 상품 ID</th>
            <th>상품 명</th>
            <th>구매 수량</th>
            <th>구매 금액</th>
            <th>수수료 비율</th>
            <th>수수료</th>
          </tr>
        </thead>
        <tbody>
          {data}
        </tbody>
      </table>
    );
  }
  return <div className="color_b7 font_14">해당 정보가 존재하지 않습니다.</div>;
}

const CancelsDataTable = (props) => {
  const isData = props.isData;
  if (isData) {
    const data = props.data.map((item, index) => (
      <tr key={index}>
        <td>{item.orderDate}</td>
        <td>{item.date}</td>
        <td>{item.orderId}</td>
        <td>{item.productId}</td>
        <td>{item.productName}</td>
        <td>{item.quantity}</td>
        <td>{item.gmv}</td>
        <td>{item.commissionRate}</td>
        <td>{item.commission}</td>
      </tr>
    ));
    return (
      <table>
        <thead>
          <tr>
            <th>최초 주문 날짜</th>
            <th>날짜</th>
            <th>주문 번호</th>
            <th>쿠팡 상품 ID</th>
            <th>상품명</th>
            <th>구매 수량</th>
            <th>구매 금액</th>
            <th>수수료 비율</th>
            <th>수수료</th>
          </tr>
        </thead>
        <tbody>
          {data}
        </tbody>
      </table>
    );
  }
  return <div className="color_b7 font_14">해당 정보가 존재하지 않습니다.</div>;
}

class Status extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coupang_API: {
        access_key: '',
        secret_key: ''
      },
      clicksStartDate: '',
      clicksEndDate: '',
      ordersStartDate: '',
      ordersEndDate: '',
      cancelsStartDate: '',
      cancelsEndDate: '',
      target: '',
      clicksData: { isData: false, data: [] },
      ordersData: { isData: false, data: [] },
      cancelsData: { isData: false, data: [] },
    };
    this.handleMessageClose = this.handleMessageClose.bind(this);
    this.handleSetStartDate = this.handleSetStartDate.bind(this);
    this.handleSetEndDate = this.handleSetEndDate.bind(this);
    this.handleClicks = this.handleClicks.bind(this);
    this.handleCursorBlur = this.handleCursorBlur.bind(this);
    this.handleReportInfo = this.handleReportInfo.bind(this);
    this.handleSetReportsInfoData = this.handleSetReportsInfoData.bind(this);
  };

  componentDidMount() {
    const coupang_api = this.state.coupang_API;
    coupang_api.access_key = localStorage.getItem('access_key');
    coupang_api.secret_key = localStorage.getItem('secret_key');

    if (!coupang_api.access_key && !coupang_api.secret_key) {
      ipcRenderer.on('response_settingscoupangapi_store_settingscoupangapi_data', (event, data) => {
        console.log('=== response_settings coupang api_store_settings coupang api_data ===');
        console.log(data);
        if (data.status === 'success') {
          const ACCESS_KEY = localStorage.getItem('access_key');
          const SECRET_KEY = localStorage.getItem('secret_key');
          if (!ACCESS_KEY && !SECRET_KEY) {
            localStorage.setItem('access_key', data.data.access_key);
            localStorage.setItem('secret_key', data.data.secret_key);
          }
          if (data.data) {
            const res_coupang_api = this.state.res_coupang_API;
            res_coupang_api.access_key = data.data.access_key;
            res_coupang_api.secret_key = data.data.secret_key;
            this.setState({ res_coupang_api });
          } else {
            const res_coupang_api = this.state.res_coupang_API;
            res_coupang_api.access_key = localStorage.getItem('access_key')
            res_coupang_api.secret_key = localStorage.getItem('secret_key')
          }
        }
      });
      ipcRenderer.send('request_settingscoupangapi_load_data', {});
    }
    console.log(this.state.coupang_API);
    if (!this.state.coupang_API.access_key) this.props.history.push('/settings');
    if (!this.state.coupang_API.secret_key) this.props.history.push('/settings');
    console.log('Status');
  };

  handleMessageClose(e) {
    e.target.parentElement.className = 'displaynone';
  };

  handleClicks(e) {
    const id = e.target.id;
    if (id) this.setState({ target: e.target.id });
  };

  handleSetStartDate(date) {
    const formatDate = Number(getFormatDate(date));
    const target = this.state.target;

    if (formatDate >= 20181101) {
      if (target.indexOf('clicks') > -1) this.setState({ clicksStartDate: formatDate });
      if (target.indexOf('orders') > -1) this.setState({ ordersStartDate: formatDate });
      if (target.indexOf('cancels') > -1) this.setState({ cancelsStartDate: formatDate });
    } else {
      document.getElementById('startDateError').className = 'message warning';
    }

    document.getElementById(target).blur();
    document.getElementById(target).readOnly = true;
  };

  handleSetEndDate(date) {
    const formatDate = getFormatDate(date);
    const target = this.state.target;
    if (target.indexOf('clicks') > -1) this.setState({ clicksEndDate: formatDate });
    if (target.indexOf('orders') > -1) this.setState({ ordersEndDate: formatDate });
    if (target.indexOf('cancels') > -1) this.setState({ cancelsEndDate: formatDate });

    document.getElementById(target).blur();
    document.getElementById(target).readOnly = true;
  };

  handleCursorBlur(e) {
    e.target.blur();
  };

  handleReportInfo(e) {
    e.preventDefault();
    const target = e.target.id;
    const ACCESS_KEY = this.state.coupang_API.access_key;
    const SECRET_KEY = this.state.coupang_API.secret_key;
    const date = { startDate: '', endDate: '', url: 'reports/' };

    if (target === 'clicks') {
      date.startDate = this.state.clicksStartDate;
      date.endDate = this.state.clicksEndDate;
    } else if (target === 'orders') {
      date.startDate = this.state.ordersStartDate;
      date.endDate = this.state.ordersEndDate;
    } else if (target === 'cancels') {
      date.startDate = this.state.cancelsStartDate;
      date.endDate = this.state.cancelsEndDate;
    }
    date.url += target;
    
    if (date.startDate && date.endDate) {
      (async () => {
        const REQUEST_METHOD = 'GET';
        const DOMAIN = 'https://api-gateway.coupang.com';
        const URL = '/v2/providers/affiliate_open_api/apis/openapi/v1/';
        const REQUEST_URL = `${date.url}?startDate=${date.startDate}&endDate=${date.endDate}`;
        const authorization = generateHmac(REQUEST_METHOD, `${URL}${REQUEST_URL}`, SECRET_KEY, ACCESS_KEY);
        axios.defaults.baseURL = `${DOMAIN}${URL}`;

        try {
          const response = await axios.request({
            method: REQUEST_METHOD,
            url: REQUEST_URL,
            headers: { Authorization: authorization },
          });
          const data = { target: '', data: [] };
          data.target = target;
          data.data = response.data.data;
          this.handleSetReportsInfoData(data);
        } catch (err) {
          console.log(err.response.data);
        }
      })();
    } else {
      document.getElementById('DateEmptyError').className = 'message warning';
    }
  }

  handleSetReportsInfoData(data) {
    if (data.target === 'clicks') {
      const dataset = [];
      dataset.push(['일시', '클릭 수']);
      data.data.forEach((item) => {
        dataset.push([item.date, item.click]);
      });
      const clicksData = this.state.clicksData;
      if (data.data.length > 0) {
        clicksData.isData = true;
        clicksData.data = dataset;
      }
      this.setState({ clicksData });
    } else if (data.target === 'orders') {
      const ordersData = this.state.ordersData;
      ordersData.isData = false;
      if (data.data.legnth > 0) {
        ordersData.isData = true;
        ordersData.data = data.data;
      }
      this.setState({ ordersData });
    } else if (data.target === 'cancels') {
      const cancelsData = this.state.cancelsData;
      cancelsData.isData = false;
      if (data.data.legnth > 0) {
        cancelsData.isData = true;
        cancelsData.data = data.data
      }
      this.setState({ cancelsData });
    }
  };

  render() {
    return (
      <div className="status_wrap">
        <div className="message_wrap">
          <div className="message">실적 정보를 확인 하실 수 있습니다.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn"></button></div>
          <div className="message">매일 오후 12:30에 업데이트 됩니다.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn"></button></div>
          <div id="startDateError" className="message warning displaynone">시작일은 20181101보다 같거나 커야합니다.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn color_white"></button></div>
          <div id="endDateError" className="message warning displaynone">종료일은 시작일로부터 180일보다 같거나 작아야 합니다.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn color_white"></button></div>
          <div id="DateEmptyError" className="message warning displaynone">시작일과 종료일을 선택해주세요.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn color_white"></button></div>
        </div>
        
        <div className="reports_wrap">
          
          <div className="clicks_wrap display_b">
            <h3 className="wrap_title display_i_b m_r_10">일 별 클릭 수에 대한 정보</h3><div className="reports_info_btn"><button className="btn">해당 정보 확인</button></div>
            
            <div className="wrap_body">
              <div className="clicks_date_picker">
                <label htmlFor="clicks_start" className="date_wrap" onClick={this.handleClicks}>
                  <div className="date_output">{this.state.clicksStartDate}</div>
                  <DatePicker
                    onChange={this.handleSetStartDate}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    selectsStart
                    id="clicks_start"
                    className="m_r_10"
                    onFocus={this.handleCursorBlur}
                  />
                </label>
                <label htmlFor="clicks_end" className="date_wrap" onClick={this.handleClicks}>
                  <div className="date_output">{this.state.clicksEndDate}</div>
                  <DatePicker
                    onChange={this.handleSetEndDate}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    selectsStart
                    id="clicks_end"
                    className="m_r_10"
                    onFocus={this.handleCursorBlur}
                  />
                </label>
                <button id="clicks" className="btn display_i_b" onClick={this.handleReportInfo}>확인</button>
                <div className="history">
                  <ClicksInfoChart isData={this.state.clicksData.isData} data={this.state.clicksData.data} />
                </div>
              </div>
            </div>
         
          </div>
          
          <div className="orders_wrap display_b">
            <h3 className="wrap_title display_i_b m_r_10">일 별 주문 정보</h3><div className="reports_info_btn"><button className="btn">해당 정보 확인</button></div>
            
            <div className="wrap_body">
              <div className="orders_date_picker">
                <label htmlFor="orders_start" className="date_wrap" onClick={this.handleClicks}>
                  <div className="date_output">{this.state.ordersStartDate}</div>
                  <DatePicker
                    onChange={this.handleSetStartDate}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    selectsStart
                    id="orders_start"
                    className="m_r_10"
                    onFocus={this.handleCursorBlur}
                  />
                </label>
                <label htmlFor="orders_end" className="date_wrap" onClick={this.handleClicks}>
                  <div className="date_output">{this.state.ordersEndDate}</div>
                  <DatePicker
                    onChange={this.handleSetEndDate}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    selectsStart
                    id="orders_end"
                    className="m_r_10"
                    onFocus={this.handleCursorBlur}
                  />
                </label>
                <button id="orders" className="btn display_i_b" onClick={this.handleReportInfo}>확인</button>
              </div>
              <div className="history"><OrdersDataTable isData={this.state.ordersData.isData} data={this.state.ordersData.data} /></div>
            </div>
          
          </div>
          
          <div className="cancels_wrap display_b">
            <h3 className="wrap_title display_i_b m_r_10">일 별 취소 정보</h3><div className="reports_info_btn"><button className="btn">해당 정보 확인</button></div>
            
            <div className="wrap_body">
              <div className="cancels_date_picker">
                <label htmlFor="cancels_start" className="date_wrap" onClick={this.handleClicks}>
                  <div className="date_output">{this.state.cancelsStartDate}</div>
                  <DatePicker
                    onChange={this.handleSetStartDate}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    selectsStart
                    id="cancels_start"
                    className="m_r_10"
                    onFocus={this.handleCursorBlur}
                  />
                </label>
                <label htmlFor="cancels_end" className="date_wrap" onClick={this.handleClicks}>
                  <div className="date_output">{this.state.cancelsEndDate}</div>
                  <DatePicker
                    onChange={this.handleSetEndDate}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    selectsStart
                    id="cancels_end"
                    className="m_r_10"
                    onFocus={this.handleCursorBlur}
                  />
                </label>
                <button id="cancels" className="btn display_i_b" onClick={this.handleReportInfo}>확인</button>
              </div>
              <div className="history">
                <CancelsDataTable isData={this.state.cancelsData.isData} data={this.state.cancelsData.data} />
              </div>
            </div>
          
          </div>
        </div>
      </div>
    );
  };
};

export default Status;


/**
 * 클릭정보
 * data
 * date : 실적이 저장된 정보 날짜
 * trackingCode : 회원 AF 아이디(쿠팡파트너스 아이디)
 * subId : sub ID
 * addtag : {
 *  100 : 여행 상품 페이지, 
 *  200 : 상품 검색 페이지, 
 *  202 : 여행 상품 검색 페이지, 
 *  300/302 : 정기배송 페이지, 
 *  311 : 카테고리 페이지, 
 *  312 : 쿠팡 골드박스/캠페인 페이지, 
 *  313 : 브랜드 페이지, 
 *  400 : 상품 페이지, 
 *  411 : 여행 상품 페이지, 
 *  500 : 기획전 페이지, 
 *  600 : 이벤트 페이지, 
 *  700 : 로켓 배송/직구, 
 *  711 : 로켓 와우, 
 *  900 : 쿠팡 홈
 * }
 * ctag : 페이지 타입 상세
 * click : 클릭 수
 */

 /**
  * 주문정보
  * data
  * date : 실적이 저장된 정보 날짜
  * trackingCode : 회원 AF 아이디(쿠팡파트너스 아이디)
  * subId : sub ID
  * addtag : {
  *  100 : 여행 상품 페이지, 
  *  200 : 상품 검색 페이지, 
  *  202 : 여행 상품 검색 페이지, 
  *  300/302 : 정기배송 페이지, 
  *  311 : 카테고리 페이지, 
  *  312 : 쿠팡 골드박스/캠페인 페이지, 
  *  313 : 브랜드 페이지, 
  *  400 : 상품 페이지, 
  *  411 : 여행 상품 페이지, 
  *  500 : 기획전 페이지, 
  *  600 : 이벤트 페이지, 
  *  700 : 로켓 배송/직구, 
  *  711 : 로켓 와우, 
  *  900 : 쿠팡 홈
  * }
  * ctag : 페이지 타입 상세
  * orderId : 주문번호
  * productId : 상품번호
  * productName : 상품명
  * quantity : 구매수량
  * gmv : 구매액
  * commissionRate : 수수료 비율
  * commission : 수수료
  */

 /**
  * 취소 정보
  * data
  * orderData : 최초 주문 날짜
  * date : 날짜
  * trackingCode : 회원 AF 아이디(쿠팡파트너스 아이디)
  * subId : sub ID
  * addtag : {
  *  100 : 여행 상품 페이지, 
  *  200 : 상품 검색 페이지, 
  *  202 : 여행 상품 검색 페이지, 
  *  300/302 : 정기배송 페이지, 
  *  311 : 카테고리 페이지, 
  *  312 : 쿠팡 골드박스/캠페인 페이지, 
  *  313 : 브랜드 페이지, 
  *  400 : 상품 페이지, 
  *  411 : 여행 상품 페이지, 
  *  500 : 기획전 페이지, 
  *  600 : 이벤트 페이지, 
  *  700 : 로켓 배송/직구, 
  *  711 : 로켓 와우, 
  *  900 : 쿠팡 홈
  * }
  * ctag : 페이지 타입 상세
  * orderId : 주문번호
  * productId : 상품번호
  * productName : 상품명
  * quantity : 구매수량
  * gmv : 구매액
  * commissionRate : 수수료 비율
  * commission : 수수료
  */