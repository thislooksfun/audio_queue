webdriver = require 'selenium-webdriver'
firefox   = require 'selenium-webdriver/firefox'

By      = webdriver.By
wdUntil = webdriver.until

firefoxOptions = new firefox.Options()
firefoxOptions.setBinary('/Applications/Firefox.app/Contents/MacOS/firefox-bin')
firefoxOptions.headless()

driver = new webdriver.Builder()
   .forBrowser('firefox')
   .setFirefoxOptions(firefoxOptions)
   .build();



driver.get('https://www.google.com')
driver.findElement(By.name('q')).sendKeys('webdriver')

driver.sleep(1000).then(->
  driver.findElement(By.name('q')).sendKeys(webdriver.Key.TAB)
).catch (e) -> console.log e

driver.findElement(By.name('btnK')).click()

driver.sleep(2000).then(->
  driver.getTitle().then (title) ->
    if title is 'webdriver - Google Search'
      console.log 'Test passed'
    else
      console.log 'Test failed'
).catch (e) -> console.log e

driver.quit()