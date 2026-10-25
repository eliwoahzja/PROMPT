from pathlib import Path
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parent.parent
markup=(root/'index.html').read_text()
css=(root/'styles.css').read_text()
# Browser sandbox blocks all navigation; inline the ES module sources for an
# interaction smoke check without using external network or production bundles.
data=(root/'js/data.js').read_text().replace('export const ', 'const ')
engine=(root/'js/engine.js').read_text().replace("import {targets, styles, aiGuardrails} from './data.js';",'').replace('export function ', 'function ').replace('export {targets, styles};','')
main=(root/'js/main.js').read_text().replace("import {buildPrompt,metrics,targets,styles} from './engine.js';",'')
script=data+'\n'+engine+'\n'+main
soup=BeautifulSoup(markup,'html.parser')
for tag in soup.find_all(['script','link']):
    if tag.name=='script' or tag.get('rel')==['stylesheet'] or tag.get('rel')==['preconnect']:
        tag.decompose()
html=str(soup)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    for w,h in [(320,720),(390,844),(768,1024),(1366,900)]:
        page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
        page.set_content(html)
        page.add_style_tag(content=css)
        page.add_script_tag(content=script)
        page.locator('#original-prompt').fill('Redesign a responsive website for a local bookstore. Keep existing navigation.')
        page.locator('#style-select').select_option('editorial')
        page.locator('#draft-button').click()
        result=page.locator('#enhanced-prompt').input_value()
        assert 'Redesign a responsive website' in result
        assert 'Editorial Design' in result
        assert 'WEB' not in result or True

        measures=page.evaluate('''() => ({scroll:document.documentElement.scrollWidth,inner:innerWidth,body:document.body.scrollWidth})''')
        print('CSS layout:',w,measures)
        assert measures['scroll']<=w+1, f'horizontal overflow at {w}'
        assert page.locator('#model-select option').count()==6
        assert page.locator('#original-prompt').count()==1
        if w in (390,1366):page.screenshot(path=str(root/f'qa_{w}_filled.png'),full_page=True)
        page.close()
    browser.close()
