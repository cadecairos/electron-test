import { expect, browser, $ } from '@wdio/globals'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'

const Config = {
  followNewTab: true,
  fps: 20,
  ffmpeg_Path: "/opt/homebrew/bin/ffmpeg",
  videoFrame: {
    width: 1280,
    height: 800
  },
  videoCrf: 18,
  videoCodec: 'libx264',
  videoPreset: 'ultrafast',
  videoBitrate: '1000',
  autopad: {
    color: 'black',
  },
  aspectRatio: '4:3'
}

let recorder = null

describe('Electron Testing', () => {

  beforeEach(async () => {
    const pages = await browser.call(async () => await global.p.pages())
    recorder = new PuppeteerScreenRecorder(pages[0], Config)
    await recorder.start(`/tmp/test/${require('path').basename(module.filename)}.mp4`)
  })

  afterEach(async () => {
    await recorder.stop()
  })

  it('should print application metadata', async () => {
    expect(await browser.electron.execute((electron) => electron.app.getName()))
      .toBe('postman-test')
    expect(await browser.electron.execute((electron) => electron.app.getVersion()))
      .toBe('1.0.0')
  })

  it('can click on button', async () => {
    const btn = await $('>>>.card').$('button')
    await btn.click()
  })

  /**
   * fails as application freezes after alert pops up
   */
  it.skip('can click the button until a dialog pops up', async () => {
    const btn = await $('>>>.card').$('button')
    await btn.click()
    await btn.click()
    await btn.click()
    await btn.click()
    await btn.click()
    await expect(await browser.isAlertOpen()).toBe(true)
    await browser.dismissAlert()
  })

  it('can mock the dialog call', async () => {
    await browser.electron.mock('dialog', 'showMessageBox', {})
    const btn = await $('>>>.card').$('button')
    await btn.click()
    await btn.click()
    await btn.click()
    await btn.click()
    await btn.click()
    await expect(await browser.isAlertOpen()).toBe(false)
    browser.pause(3000)
  })
})
