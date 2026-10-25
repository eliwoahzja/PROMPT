"""Browser smoke test. Serves the project over local HTTP, blocks external hosts, and checks layout + interaction."""
import http.server, threading, functools, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
root = Path(__file__).resolve().parent.parent
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
handler.log_message = lambda *a, **k: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{srv.server_address[1]}/'
exe = next((p for p in ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'] if Path(p).exists()), None)
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, executable_path=exe, args=['--no-sandbox']) if exe else p.chromium.launch(headless=True, args=['--no-sandbox'])
    for w, h in [(320, 720), (390, 844), (768, 1024), (1366, 900)]:
        page = browser.new_page(viewport={'width': w, 'height': h})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('**/*', lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
        page.goto(base)
        page.wait_for_selector('#target-select option')
        assert page.locator('#target-select option').count() == 15, 'expected 15 destinations'
        labels = page.locator('#target-select option').all_inner_texts()
        for wanted in ['Cursor','Lovable','Codex','Z.ai / GLM-5.3-Flash','GPT-6 Astra','GPT-6.1 Sol','GPT-6 Sol','GPT-6 Luna','GPT-6 (ChatGPT)','DeepSeek V4.1 Flash (10/17)']:
            assert wanted in labels, wanted
        page.locator('#target-select').select_option('gpt6-astra')
        assert 'gpt-6-astra' in page.locator('#target-note').inner_text()
        page.locator('#example-button').click()
        page.locator('#detail-group [data-depth=thorough]').click()
        page.locator('#enhance-button').click()
        out = page.locator('#enhanced-prompt').input_value()
        assert 'dog-grooming shop' in out and 'Neo-Brutalism' in out, 'draft missing request or style'
        fails = page.locator('#receipt .badge[data-pass=false]').count()
        passes = page.locator('#receipt .badge[data-pass=true]').count()
        assert fails == 0 and passes >= 5, (fails, passes)
        m = page.evaluate('() => ({scroll: document.documentElement.scrollWidth, inner: innerWidth})')
        assert m['scroll'] <= w + 1, f'horizontal overflow at {w}: {m}'
        small = page.evaluate('''() => [...document.querySelectorAll("button,select,.seg,input[type=email]")]
            .filter(e => e.offsetParent !== null).map(e => e.getBoundingClientRect()).filter(r => r.height < 43).length''')
        assert small == 0, f'{small} controls under 44px at {w}'
        assert not errors, errors
        print('ok', w, m, 'checks passed:', passes)
        if w in (390, 1366): page.screenshot(path=str(root / f'qa_{w}.png'), full_page=True)
        page.close()
    browser.close()
srv.shutdown()
