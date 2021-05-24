import React from 'react';

import '../../stylesheets/Settings/index.css';

const { ipcRenderer } = window;

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      naver: { id: '', pw: '' },
      coupang_API: { access_key: '', secret_key: '' },
      isInfoChange: { naver: false, coupang_API: false },
    };
    this.handleMessageClose = this.handleMessageClose.bind(this);
    this.handleNaverId = this.handleNaverId.bind(this);
    this.handleNaverPw = this.handleNaverPw.bind(this);
    this.handleCoupangAccessKey = this.handleCoupangAccessKey.bind(this);
    this.handleCoupangSecretKey = this.handleCoupangSecretKey.bind(this);
    this.handleDataAuth = this.handleDataAuth.bind(this);
    this.handleAPIAuth = this.handleAPIAuth.bind(this);
  };

  componentDidMount() {
    const naver = this.state.naver;
    const naverData = { id: localStorage.getItem('naverId'), pw: localStorage.getItem('naverPw') };
    if (!naverData.id && !naverData.pw) {
      ipcRenderer.send('request_naver_data_load_data', {});
      ipcRenderer.on('response_naver_data_load_data', (event, data) => {
        console.log('=== response_naver_data_load_data ===');
        console.log(data);

        if (data.status === 'success') {
          const dataset = { naverId: data.data.id, naverPw: data.data.pw };
          localStorage.setItem('naver_account', JSON.stringify(dataset));

          naver.id = data.data.id;
          naver.pw = data.data.pw;
          this.setState({ naver });
          
          const isInfoChange = this.state.isInfoChange;
          isInfoChange.naver = true;
          this.setState({ isInfoChange });
        } else {
          document.getElementById('naverAccountNoData').className = 'message warning';
        }
      });
    } else {
      naver.id = naverData.id;
      naver.pw = naverData.pw;
      this.setState({ naver });

      const isInfoChange = this.state.isInfoChange;
      isInfoChange.naver = true;
      this.setState({ isInfoChange });
    }

    const coupangAPI = this.state.coupang_API;
    const coupangAPIData = { access_key: localStorage.getItem('access_key'), secret_key: localStorage.getItem('secret_key') };
    if (!coupangAPIData.access_key && !coupangAPIData.secret_key) {
      ipcRenderer.send('request_coupangapi_data_load_data', {});
      ipcRenderer.on('response_coupangapi_data_load_data', (event, data) => {
        console.log('=== response_coupangapi_data_load_data ===');
        console.log(data);

        if (data.status === 'success') {
          const dataset = { access_key: data.data.access_key, secret_key: data.data.secret_key };
          localStorage.setItem('coupang_apikey', JSON.stringify(dataset));

          coupangAPI.access_key = data.data.access_key;
          coupangAPI.secret_key = data.data.secret_key;
          this.setState({ coupangAPI });
          
          const isInfoChange = this.state.isInfoChange;
          isInfoChange.coupang_API = true;
          this.setState({ isInfoChange });
        } else {
          try {
            document.getElementById('coupangAPINoData').className = 'message warning';
          } catch (err) {
            console.log(err);
          }
        }
      });
    } else {
      coupangAPI.access_key = coupangAPIData.access_key;
      coupangAPI.secret_key = coupangAPIData.secret_key;
      this.setState({ coupangAPI });
      
      const isInfoChange = this.state.isInfoChange;
      isInfoChange.coupang_API = true;
      this.setState({ isInfoChange });
    }
    console.log('Settings');
  };

  handleMessageClose(e) {
    e.target.parentElement.className = 'displaynone';
  };

  handleNaverId(e) {
    const naver = this.state.naver;
    naver.id = e.target.value;
    this.setState({ naver });
  };

  handleNaverPw(e) {
    const naver = this.state.naver;
    naver.pw = e.target.value;
    this.setState({ naver });
  };

  handleCoupangAccessKey(e) {
    const coupang_API = this.state.coupang_API;
    coupang_API.access_key = e.target.value;
    this.setState({ coupang_API });
  };

  handleCoupangSecretKey(e) {
    const coupang_API = this.state.coupang_API;
    coupang_API.secret_key = e.target.value;
    this.setState({ coupang_API });
  };

  handleDataAuth(e) {
    const id = e.target.id;
    const target = id.split('_')[0];
    const isChange = id.split('_')[1];

    if (isChange === 'false') {
      if (this.state.naver.id && this.state.naver.pw) {
        const data = { target: target, account: this.state.naver };
        ipcRenderer.send('request_naver_data_store_data', data);
        ipcRenderer.on('response_naver_data_store_data', (event, data) => {
          console.log('=== response_naver_data_store_data ===');
          if (data.status === 'success') {
            localStorage.setItem('naverId', data.data.id);
            localStorage.setItem('naverPw', data.data.pw);

            const isInfoChange = this.state.isInfoChange;
            isInfoChange.naver = true;
            this.setState({ isInfoChange });

            window.location.reload();
          }
        });
      } else {
        document.getElementById('naverAccountEmpty').className = 'message warning';
      }
    } else {
      const isInfoChange = this.state.isInfoChange;
      isInfoChange.naver = false;
      this.setState({ isInfoChange });
    }
  };

  handleAPIAuth(e) {
    const id = e.target.id;
    const isChange = id.split('_')[1];

    const ACCESS_KEY = this.state.coupang_API.access_key;
    const SECRET_KEY = this.state.coupang_API.secret_key;
    
    if (isChange === 'false') {
      if (ACCESS_KEY && SECRET_KEY) {
        const data = { access_key: ACCESS_KEY, secret_key: SECRET_KEY };
        ipcRenderer.send('request_coupangapi_data_store_data', data);
        ipcRenderer.on('response_coupangapi_data_store_data', (event, data) => {
          console.log('=== response_coupangapi_data_store_data ===');
          console.log(data);
          if (data.status === 'success') {
            localStorage.setItem('access_key', data.data.access_key);
            localStorage.setItem('secret_key', data.data.secret_key);

            const isInfoChange = this.state.isInfoChange;
            isInfoChange.coupang_API = true;
            this.setState({ isInfoChange });

            window.location.reload();
          }
        });
      } else {
        document.getElementById('coupangAPIEmpty').className = 'message warning';
      }
    } else {
      const isInfoChange = this.state.isInfoChange;
      isInfoChange.coupang_API = false;
      this.setState({ isInfoChange });
    }
  };

  render() {
    return (
      <div className="settings_wrap">
        <div className="message_wrap">
          <div className="message">쿠팡파트너스 API를 연동하기 위해 ACCESS KEY, SECRET KEY를 직접입력해주세요.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn"></button></div>
          <div className="message">쿠팡파트너스 계정을 입력 후 가져오기 버튼을 누르시면, 자동으로 ACCESS KEY, SECRET KEY를 가져옵니다.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn"></button></div>
          <div className="message">단, API Key가 없거나 등록되지 않은 계정인 경우 가져올 수 없습니다.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn"></button></div>
          <div id="coupangAPIEmpty" className="message warning displaynone">쿠팡 파트너스 access key와 secret key를 입력해주세요.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn color_white"></button></div>
          <div id="coupangAPINoData" className="message warning displaynone">쿠팡 파트너스 access key와 secret key를 등록해주세요.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn color_white"></button></div>
          <div id="naverAccountEmpty" className="message warning displaynone">네이버 아이디와 비밀번호 입력해주세요.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn color_white"></button></div>
          <div id="naverAccountNoData" className="message warning displaynone">네이버 아이디와 비밀번호 등록해주세요.<button onClick={this.handleMessageClose} className="btn_unset message_close_btn color_white"></button></div>
        </div>
        <div className="naver_account_auth_wrap">
          <div className="form_field_title">네이버 계정</div>
          <div className="form_field">
            <label htmlFor="username">아이디</label>
            <input type="text" id="username" placeholder="네이버 아이디" value={this.state.naver.id} readOnly={this.state.isInfoChange.naver ? true : false} onChange={this.handleNaverId} />
          </div>
          <div className="form_field m_b_0">
            <label htmlFor="password">비밀번호</label>
            <input type="password" id="password" placeholder="네이버 비밀번호" value={this.state.naver.pw} readOnly={this.state.isInfoChange.naver ? true : false} onChange={this.handleNaverPw} />
          </div>
          <div className="form_field">
            <button
              type="button"
              className="btn m_t_10"
              id={this.state.isInfoChange.naver ? 'naver_true' : 'naver_false'}
              onClick={this.handleDataAuth}
            >
              {this.state.isInfoChange.naver ? '수정' : '확인'}
            </button>
          </div>
        </div>
        <div className="coupang_apikey_wrap">
          <div className="form_field_title">쿠팡파트너스 API</div>
          <div className="form_field">
            <label htmlFor="accesskey">ACCESS KEY</label>
            <input type="text" id="accesskey" placeholder="ACCESS KEY 입력" value={this.state.coupang_API.access_key} readOnly={this.state.isInfoChange.coupang_API ? true : false} onChange={this.handleCoupangAccessKey} />
          </div>
          <div className="form_field m_b_0">
            <label htmlFor="secretkey">SECRET KEY</label>
            <input type="text" id="secretkey" placeholder="SECRET KEY 입력" value={this.state.coupang_API.secret_key} readOnly={this.state.isInfoChange.coupang_API ? true : false} onChange={this.handleCoupangSecretKey} />
          </div>
          <div className="form_field">
            <button
              type="button"
              className="btn m_t_10"
              id={this.state.isInfoChange.coupang_API ? 'coupangAPI_true' : 'coupangAPI_false'}
              onClick={this.handleAPIAuth}
            >
              {this.state.isInfoChange.coupang_API ? '수정' : '확인'}
            </button>
          </div>
        </div>
      </div>
    );
  };
};

export default Settings;