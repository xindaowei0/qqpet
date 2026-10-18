import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const service = readFileSync(new URL('../../android/app/src/main/java/net/ankio/qqpet/PetService.kt', import.meta.url), 'utf8')
const assets = readFileSync(new URL('../../android/app/src/main/java/net/ankio/qqpet/AssetClient.kt', import.meta.url), 'utf8')
const setBounds = service.slice(service.indexOf('private fun setBounds('), service.indexOf('private fun http('))

test('moving the overlay never hides it (#18: the pet blanked on every tap or menu)', () => {
  assert.ok(setBounds.includes('wm.updateViewLayout(root, params)'))
  assert.doesNotMatch(setBounds, /params\.alpha\s*=/)
  assert.doesNotMatch(service, /registerFrameCommitCallback/)
})

test('the page offset is applied in the same layout as the window move', () => {
  const offset = setBounds.indexOf('web.translationX = -nx')
  assert.ok(offset >= 0 && offset < setBounds.indexOf('wm.updateViewLayout(root, params)'))
})

test('tablets lay the page out at one CSS pixel per dp and tell the renderer so', () => {
  assert.match(assets, /val tablet = .*smallestScreenWidthDp >= TABLET_SMALLEST_WIDTH/)
  assert.match(assets, /val scale = if \(tablet\) 1f else/)
  assert.match(service, /fun deviceKind\(\): String = if \(resources\.configuration\.smallestScreenWidthDp >= TABLET_SMALLEST_WIDTH\) "tablet" else "phone"/)
})
