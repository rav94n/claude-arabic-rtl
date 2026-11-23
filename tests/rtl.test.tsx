import { expect, test } from 'claude-code/testing'

const BASE = { plugin: 'arabic-rtl', surface: 'desktop', component: 'AssistantMessage' } as const

test('an Arabic reply draws right to left, its code left to right', async $ => {
  const ui = await $.ui.mount({
    ...BASE,
    props: { text: 'مرحبا بك\n```js\nconsole.log(1)\n```', isFirstOfReply: true },
  })
  const text = await ui.find({ type: 'Text' })
  expect(text?.props.dir).toBe('rtl')
  expect(await ui.find({ type: 'Code' })).toBeDefined()
  await ui.unmount()
})

test('an English reply keeps the normal drawing', async $ => {
  const ui = await $.ui.mount({ ...BASE, props: { text: 'Hello there', isFirstOfReply: true } })
  const text = await ui.find({ type: 'Text' })
  expect(text?.props.dir).toBeUndefined()
  await ui.unmount()
})
