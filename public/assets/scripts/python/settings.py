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

class Settings:
  def __init__(self, account, **kwargs):
    self.driver = self.get_Driver()
    target = sys.argv[1]
    if target == 'naver':
      id = "'%s'"%(account['id'])
      pw = "'%s'"%(account['pw'])
      self.naverLogin(id, pw)
    # elif target == 'cp_partners':
    #   id = "'%s'"%(account['id'])
    #   pw = "'%s'"%(account['pw'])
    #   self.coupangLogin(id, pw)


  # selenium init 
  def get_Driver(self):
    try:
      self.driver.close()
    except:
      pass
    try:  # mac
      chromedriver = './public/assets/scripts/python/bin/chromedriver_mac'
      os.environ['webdriver.chrome.driver'] = chromedriver
      options = webdriver.ChromeOptions()
      options.headless = True
      options.add_argument('window-size=1920x1080')
      options.add_experimental_option('detach', True)

      driver = webdriver.Chrome(chromedriver, options=options)
      return driver
    except Exception as E:
      print(E)
      pass
    try: # win32
      chromedriver = './public/assets/scripts/python/bin/chromedriver.exe'
      os.environ['webdriver.chrome.driver'] = chromedriver
      options = webdriver.ChromeOptions()
      options.headless = True
      options.add_argument('window-size=1920x1080')
      options.add_experimental_option('detach', True)

      driver = webdriver.Chrome(chromedriver, options=options)
      return driver
    except Exception as E:
      print(E)
      pass


  def naverLogin(self, id, pw):
    self.driver.get('https://nid.naver.com/nidlogin.login')
    self.driver.execute_script("document.getElementsByName('id')[0].value=" + id)
    self.driver.execute_script("document.getElementsByName('pw')[0].value=" + pw)

    self.driver.find_element_by_xpath('//*[@id="frmNIDLogin"]/fieldset/input').click()
    self.driver.implicitly_wait(3)
    time.sleep(2)
    if self.driver.current_url.find('nidlogin') > -1:
      print('error')
    else:
      self.driver.get('https://blog.naver.com/%s/postwrite?useSmartEditorVersion=4' % (id.replace("'", '')))
      print('success')

    time.sleep(2)
    self.driver.close()

  # # 쿠팡 파트너스 계정 로그인 관련
  # def coupangLogin(self, id, pw):
  #   self.driver.get('https://partners.coupang.com/')
  #   self.driver.find_element_by_xpath('//*[@id="app-header"]/div[2]/div/button[1]').click()

  #   self.driver.execute_script("document.getElementById('login-email-input').value=" + id)
  #   self.driver.execute_script("document.getElementById('login-password-input').value=" + pw)


if __name__ == "__main__":
  account = sys.argv[2]
  account = json.loads(account)
  Settings(account, debug=True)

sys.stdout.flush()