# _*_ coding:utf-8 _*_

import re
import os
import sys
import json
import time
import hmac
import hashlib
import requests
import binascii
import platform

from selenium import webdriver
from selenium.webdriver.common import keys
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.remote.file_detector import UselessFileDetector

class Controller:
  def __init__(self, account, **kwargs):
    self.driver = self.get_Driver()
    id = "'%s'"%(account['NAVER_ID'])
    pw = "'%s'"%(account['NAVER_PASSWORD'])
    self.run(id, pw)

  # selenium init
  # base path = './public/assets/scripts/python/bin'
  def get_Driver(self):
    try:
      self.driver.close()
    except:
      pass
    try:  # mac
      chromedriver = './public/assets/scripts/python/bin/chromedriver_mac'
      # os.environ['webdriver.chrome.driver'] = chromedriver
      # options = webdriver.ChromeOptions()
      # options.headless = True
      # options.add_argument('window-size=1920x1080')
      # options.add_experimental_option('detach', True)

      # driver = webdriver.Chrome(chromedriver, options=options)
      # return driver
      return webdriver.Chrome(chromedriver)
    except Exception as E:
      print(E)
      pass
    try: # win32
      # chromedriver = './public/assets/scripts/python/bin/chromedriver.exe'
      # os.environ['webdriver.chrome.driver'] = chromedriver
      # options = webdriver.ChromeOptions()
      # options.headless = True
      # options.add_argument('window-size=1920x1080')
      # options.add_experimental_option('detach', True)

      # driver = webdriver.Chrome(chromedriver, options=options)
      # return driver
      return webdriver.Chrome(chromedriver)
    except Exception as E:
      print(E)
      pass

  def setCategory(self, id, category):
    self.driver.get('https://admin.blog.naver.com/AdminCategoryView.nhn?blogId=%s'%(id.replace("'", '')))
    categoriesLength = len(self.driver.find_elements_by_xpath('//*[@id="tree"]/li'))
    
    isCategory = False

    for i in range(1, categoriesLength + 1):
      xpath = '//*[@id="tree"]/li[%c]/div/label/span'%(str(i))
      categoryName = self.driver.find_element_by_xpath(xpath).text
      if categoryName == category:
        isCategory = True

    if isCategory == False:
      self.driver.find_element_by_xpath('//*[@id="tree"]/li[1]/div/label').click()
      self.driver.find_element_by_xpath('//*[@id="categoryConfigureView"]/table[2]/tbody/tr/td[1]/div/div[1]/a[1]').click()
      self.driver.execute_script("document.getElementById('category_name').value='" + category + "'")
      self.driver.find_element_by_id('category_name').send_keys(Keys.ENTER)
      self.driver.find_element_by_xpath('//*[@id="submit_button"]').click()
    time.sleep(2)

    print('>>> login continue <<<')

  # 로그인
  # "작성 중인 글이 있습니다." 팝업
  def already_write_popup_close(self):
    try:
      self.driver.find_element_by_css_selector('.se-popup-button-cancel').click()
    except:
      print('작성 중인 글이 있습니다. 팝업이 없음')
    time.sleep(0.5)

  # 우측에 뜨는 도움말 때문에 .se-component-content 마지막 클릭시 clickable에러 발생
  def helper_close(self):
    try:
      self.driver.find_element_by_css_selector('.se-help-panel-close-button').click()
    except:
      print('우측에 helper가 없음.')
    time.sleep(0.5)

  def move_blog_editor(self, id):
    # self.setCategory(id, category)
    self.driver.get('https://blog.naver.com/%s/postwrite?useSmartEditorVersion=4'%(id.replace("'", '')))
    time.sleep(2)

    self.already_write_popup_close()
    self.helper_close()

  def naverLogin(self, id, pw):
    self.driver.get('https://nid.naver.com/nidlogin.login')
    self.driver.execute_script("document.getElementsByName('id')[0].value=" + id)
    self.driver.execute_script("document.getElementsByName('pw')[0].value=" + pw)

    # self.driver.find_element_by_id('label_ip_on').click()
    self.driver.find_element_by_xpath('//*[@id="frmNIDLogin"]/fieldset/input').click()
    time.sleep(2)
    
  # 포스팅 관련 매서드
  def inputText(self, text):
    actions = ActionChains(self.driver).send_keys(text)
    actions.perform()
    time.sleep(0.5)

  def inputTexts(self, texts):
    if type(texts) == str:
      self.inputText(texts)
    elif type(texts) == list:
      for text in texts:
        if type(text) == dict:
          for key, value in enumerate(text):
            self.inputText(key)
            self.inputText(' - ')
            self.inputText(value)
            self.inputText('\n')
    elif type(texts) == dict:
      for key, value in enumerate(texts):
          self.inputText(key)
          self.inputText(' - ')
          self.inputText(value)
          self.inputText('\n')

  def inputImgLink(self, imgLink):
    self.driver.find_element_by_xpath('//*[@id="blog-editor"]/div/div[1]/div/header/div[1]/ul/li[8]/button').click()
    time.sleep(0.5)

    rearchBtn = self.driver.find_element_by_xpath('//*[@id="blog-editor"]/div/div[1]/div/div[4]/div[2]/div[1]/div[2]/div[1]/button')
    actions = ActionChains(self.driver).send_keys(imgLink).click(rearchBtn)
    actions.perform()
    time.sleep(1)

    self.driver.find_element_by_xpath('//*[@id="blog-editor"]/div/div[1]/div/div[4]/div[2]/div[2]/button').click()
    time.sleep(1)

  def inputImgLinks(self, imgLinks):
    if type(imgLinks) == str:
      self.inputImgLink(imgLinks)
    elif type(imgLinks) == list:
      for link in imgLinks:
        self.inputImgLink(link)

  def inputTag(self, name, category):
    specChar = r'[-=+,#/\?:^$.@*\"※~&%ㆍ!』\\‘|\(\)\[\]\<\>`\'…》]'
    name = re.sub(specChar, ' ', name)
    category = re.sub(specChar, ' ', category)
    # [-=+,#/\?:^$.@*\"※~&%ㆍ!』\\‘|\(\)\[\]\<\>`\'…》]
    self.driver.find_element_by_id('tag-input').click()
    actions = ActionChains(self.driver)
    actions.send_keys(name)
    actions.send_keys(Keys.RETURN)  # 엔터키
    actions.send_keys(category)
    actions.send_keys(Keys.RETURN)
    actions.perform()
    time.sleep(2)    

  def inputContent(self, content):
    title = '[{0}] {1}'.format(content['categoryName'], content['productName'])
    detailUrl = content['productUrl']
    # price = '가격 : {}원'.format(format(content['productPrice'], ','))
    category = '카테고리 : {}'.format(content['categoryName'])
    main_image = content['productImage']
    productDetailImages = content['productDetailImages']

    self.driver.find_elements_by_css_selector('.se-text-paragraph.se-text-paragraph-align-left')[0].click()
    self.inputText(title)
    self.inputText('\n')
    self.inputImgLink(detailUrl)
    # self.inputText('\n')
    # self.inputText(price)
    self.inputText('\n')
    self.inputText(category)
    self.inputText('\n')
    self.inputImgLink(main_image)
    self.inputText('\n')
    self.inputImgLinks(productDetailImages)
    self.inputText('\n')
    self.inputText('이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.')

  def publish(self, content):
    try:
      isPublish = self.driver.find_element_by_xpath('//*[@id="root"]/div/div[1]/div/div[3]/button')
      isPublish.click()
    except Exception as E:
      print(E)
      try:
        isPublish = self.driver.find_element_by_xpath('//*[@id="header"]/div/div[3]/button')
        isPublish.click()
      except Exception as E:
        print(E)
        pass

    # 카테고리 설정
                                       
    # 주제 설정
    try:
      self.driver.find_element_by_xpath('//*[@id="root"]/div/div[1]/div/div[3]/div/div/div/div[2]/div/div/a').click()
    except Exception as E:
      print(E)
      try:
        self.driver.find_element_by_xpath('//*[@id="header"]/div/div[3]/div/div[2]/div[1]/div[1]/div[2]/div/div[1]/a').click()
      except Exception as E:
        print(E)
        pass

    try:
      self.driver.find_element_by_xpath('//*[@id="패션·미용_18"]').click()
    except Exception as E:
      print(E)
      try:
        self.driver.find_element_by_xpath('//*[@id="directory-18"]').click()
      except Exception as E:
        print(E)
        pass


    try:
      self.driver.find_element_by_xpath('//*[@id="root"]/div/div[1]/div/div[3]/div/div/div/div[3]/div/button[2]').click()
    except Exception as E:
      print(E)
      try:
        self.driver.find_element_by_xpath('//*[@id="header"]/div/div[3]/div/div[1]/div[2]/div/button[2]').click()
      except Exception as E:
        print(E)
        pass


    name = content['productName']
    category = content['categoryName']

    if isPublish.get_attribute('aria-expanded'):
      self.inputTag(name, category)
    else:
      isPublish.click()
      self.inputTag(name, category)

    self.driver.find_element_by_class_name('btn_confirm').click()

  def generateHmac(self, method, url, secretKey, accessKey):
    path, *query = url.split('?')
    os.environ['TZ'] = 'GMT+0'
    datetime = time.strftime('%y%m%d') + 'T' + time.strftime('%H%M%S') + 'Z'
    message = datetime + method + path + (query[0] if query else "")

    signature = hmac.new(bytes(secretKey, 'utf-8'),
                        message.encode('utf-8'),
                        hashlib.sha256).hexdigest()

    return 'CEA algorithm=HmacSHA256, access-key={}, signed-date={}, signature={}'.format(accessKey, datetime, signature)

  def productsData(self, dataset):
    for data in dataset:
      productUrl = data['productUrl'].split('&') # 트래킹 id 포함된 주소
      baseProductURL = 'https://www.coupang.com/vp/products'
      itemId = ''
      vendorItemId = ''
      for item in productUrl:
        if item.find('itemId') > -1:
          itemId = item
        if item.find('vendorItemId') > -1:
          vendorItemId = item
      productId = data['productId']  # 상품 id

      productUrl = '{0}/{1}?{2}&{3}&isAddedCart='.format(baseProductURL, productId, itemId, vendorItemId)

      self.driver.get(productUrl)
      time.sleep(2)
      productDetailImgList = self.driver.find_elements_by_class_name('type-IMAGE_NO_SPACE')
      productDetailImgs = []
      for detail in productDetailImgList:
        detailImgUrl = detail.find_element_by_tag_name('img').get_attribute('src')
        productDetailImgs.append(detailImgUrl)

      data['productDetailImages'] = productDetailImgs

    return dataset

  def getData(self, data):
    REQUEST_METHOD = 'GET'
    PRODUCT_ID = data['category_id']
    LIMIT = data['limit']
    PRODUCT_REQUEST_URL = 'products/bestcategories/{}?limit={}'.format(PRODUCT_ID, LIMIT)

    DOMAIN = 'https://api-gateway.coupang.com'
    URL = '/v2/providers/affiliate_open_api/apis/openapi/v1/'

    PRODUCTS_URL = '{}{}'.format(URL, PRODUCT_REQUEST_URL)

    # ACCESS_KEY = '056b7ab8-fec9-4189-a104-4885e0db5186'
    # SECRET_KEY = '51f07eb3ef7de13440f89f951a25dcefd5db32b8'

    apikey = sys.argv[3]
    coupangAPI = json.loads(apikey)

    ACCESS_KEY = coupangAPI['access_key']
    SECRET_KEY = coupangAPI['secret_key']

    authorization = self.generateHmac(REQUEST_METHOD, PRODUCTS_URL, SECRET_KEY, ACCESS_KEY)

    url = "{}{}".format(DOMAIN, PRODUCTS_URL)
    response = requests.request(method=REQUEST_METHOD, url=url,
                                headers = {
                                  "Authorization": authorization,
                                  "Content-Type": "application/json"
                                })
    return response.json()['data']

  def run(self, id, pw):
    data = sys.argv[2]
    data = json.loads(data)
    contents = self.getData(data)
    productsData = self.productsData(contents)
    self.naverLogin(id, pw)
    for productData in productsData:
      self.move_blog_editor(id)
      self.inputContent(productData)
      self.publish(productData)
      self.driver.implicitly_wait(6)
    self.driver.close()


if __name__ == "__main__":
  print("main")
  account = sys.argv[1]
  account = json.loads(account)
  # account = { 'NAVER_ID': 'qkrgksdma17', 'NAVER_PASSWORD': 'Apap6411919!!##'}
  Controller(account, debug=True)

sys.stdout.flush()