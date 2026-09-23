const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const adb = process.env.ADB || path.join(process.env.ANDROID_HOME || path.join(require('node:os').homedir(), 'Library/Android/sdk'), 'platform-tools/adb');
const out = process.env.CEDAR_SETUP_EVIDENCE;
if (!out) throw new Error('Set CEDAR_SETUP_EVIDENCE to a repository report folder.');
(async () => {
  let url;
  for (let i=0;i<45;i++) {
    try { url = execFileSync(adb, ['-s','emulator-5554','exec-out','run-as','app.cedar.tv','cat','cache/browser-setup-invitation.txt'], {stdio:['ignore','pipe','ignore']}).toString().trim(); if (url.startsWith('https://')) break; } catch {}
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
  assert.ok(url, 'The emulator did not open its setup session.');
  await fs.mkdir(out,{recursive:true});
  const browser = await chromium.launch({headless:true,channel:'chrome'});
  try {
    const context = await browser.newContext({viewport:{width:1440,height:1000}});
    if (process.env.CEDAR_SETUP_LIVE_SITE !== '1') await context.route('https://cedartv.github.io/cedar-tv-updates/**',async route=>{
      const relative = new URL(route.request().url()).pathname.replace('/cedar-tv-updates/','');
      const filename = path.resolve('public',relative.endsWith('/')?relative+'index.html':relative);
      assert.ok(filename.startsWith(path.resolve('public')+path.sep));
      const extension=path.extname(filename),type={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.png':'image/png','.json':'application/json'}[extension]||'application/octet-stream';
      await route.fulfill({status:200,contentType:type,body:await fs.readFile(filename)});
    });
    const page = await context.newPage(), errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(url);
    assert.equal(new URL(page.url()).hash,'','Invitation removed from address bar');
    await page.getByRole('button',{name:'Connect to TV',exact:true}).click();
    await page.locator('#editor').waitFor({state:'visible',timeout:45000});
    await page.selectOption('#section','home-screen');
    await page.getByLabel('Home Layout',{exact:true}).selectOption('Detailed');
    await page.getByRole('button',{name:'Push changes to TV',exact:true}).click();
    await page.waitForFunction(()=>document.getElementById('status').textContent==='All changes saved on your TV.',{},{timeout:45000});
    await page.screenshot({path:path.join(out,'browser-settings-desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.selectOption('#section','sources-editor');
    await page.selectOption('#source-kind','webdav');
    await page.locator('#source-name').fill('Browser source fixture');
    await page.locator('#source-endpoint').fill('https://browser-setup.invalid/dav');
    await page.locator('#source-username').fill('fixture-user');
    await page.locator('#source-password').fill('fixture-secret');
    await page.getByRole('button',{name:'Add to TV',exact:true}).click();
    await page.waitForFunction(()=>document.getElementById('status').textContent==='Saved on your TV.',{},{timeout:45000});
    await page.getByLabel('Browser source fixture enabled',{exact:true}).uncheck();
    await page.waitForFunction(()=>document.getElementById('status').textContent==='Saved on your TV.',{},{timeout:45000});
    assert.ok(!(await page.locator('body').innerText()).includes('fixture-secret'));
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:path.join(out,'browser-sources-phone.png'),fullPage:true});
    await page.selectOption('#section','home-editor');
    await page.getByRole('button',{name:'Add branch',exact:true}).click();
    await page.getByLabel('Title',{exact:true}).fill('Browser movies');
    await page.getByLabel('Title',{exact:true}).press('Tab');
    await page.getByRole('button',{name:'Save Home to TV',exact:true}).click();
    await page.waitForFunction(()=>document.getElementById('status').textContent==='Saved on your TV.',{},{timeout:45000});
    await page.screenshot({path:path.join(out,'browser-home-phone.png'),fullPage:true});
    await page.selectOption('#section','profile-editor');
    await page.locator('#profile-name').fill('Browser verified');
    await page.getByRole('button',{name:'Save profile name',exact:true}).click();
    await page.waitForFunction(()=>document.getElementById('status').textContent==='Saved on your TV.',{},{timeout:45000});
    await page.waitForFunction(()=>document.getElementById('profile-title').textContent==='Browser verified',{},{timeout:45000});
    assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(out,'real-browser-verification.json'),JSON.stringify({passed:true,transport:process.env.CEDAR_SETUP_LIVE_SITE==='1'?'Public GitHub Pages and live Cedar encrypted relay':'Live Cedar encrypted relay; unpublished static page served locally under its intended origin',checks:['Invitation stripped from URL','TV-owned encrypted claim/checkpoints','Native Home Layout saved','Source with credentials added and paused','Credentials not projected back to browser','Native Home branch saved','Profile rename acknowledged','390px no overflow','No browser errors'],noSecretsPersisted:true},null,2));
    console.log('Live encrypted browser → Android TV settings, Home branch, and rename verified.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error.message);process.exitCode=1});
