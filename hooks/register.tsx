import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

// Off switch, kept for the session and (through $.store) across sessions.
const isOff = atom({ plugin: 'arabic-rtl', key: 'isOff' } as const, false)

// Arabic, Persian, Urdu, Hebrew, Syriac, Thaana and their presentation forms.
const RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/

type Block = { kind: 'code'; lang?: string; source: string } | { kind: 'line'; text: string; isHeading: boolean }

// Splits markdown into code fences (kept left to right) and plain lines.
function toBlocks(md: string): Block[] {
  const blocks: Block[] = []
  const lines = md.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const fence = /^\s*```\s*([\w+-]*)/.exec(line)
    if (fence) {
      const body: string[] = []
      i++
      while (i < lines.length && !/^\s*```/.test(lines[i] ?? '')) body.push(lines[i++] ?? '')
      blocks.push({ kind: 'code', lang: fence[1] || undefined, source: body.join('\n') })
      continue
    }
    const isHeading = /^\s*#{1,6}\s/.test(line)
    const text = line
      .replace(/^\s*#{1,6}\s+/, '')
      .replace(/^(\s*)[-*+]\s+/, '$1• ')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    blocks.push({ kind: 'line', text, isHeading })
  }
  return blocks
}

// Draws one line: right-to-left lines sit flush against the right edge.
function line(Box: any, Text: any, text: string, isHeading = false) {
  const shown = text === '' ? ' ' : text
  if (!RTL.test(text)) return <Text weight={isHeading ? 'bold' : undefined}>{shown}</Text>
  // A right-to-left mark at each end keeps punctuation and list numbers on the
  // correct side even where the surface lays the row out left to right.
  const marked = '\u200F' + shown + '\u200F'
  return (
    <Box flexDirection="column" alignItems="flex-end">
      <Text dir="rtl" weight={isHeading ? 'bold' : undefined}>{marked}</Text>
    </Box>
  )
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      await $.command.register({ name: 'rtl', description: 'Turn right-to-left drawing of Arabic messages on or off' })
      const saved = await $.store.get('isOff')
      if (typeof saved === 'boolean') await update($, isOff, () => saved)
    } catch {
      // Never let setup block the session from opening.
    }
    return next(e)
  })

  on('command.run', { command: 'rtl' }, async $ => {
    let off = false
    await update($, isOff, v => (off = !v))
    try {
      await $.store.set('isOff', off)
    } catch {}
    return { text: off ? 'RTL is off: messages draw as normal.' : 'RTL is on: Arabic messages draw right to left.' }
  })

  on('ui.render', { component: 'AssistantMessage' }, async ($, e, next) => {
    try {
      if ((await read($, isOff)) || !RTL.test(e.props.text)) return next(e)
      const { Box, Text, Code } = $.ui.resolve(e)
      return (
        <Box flexDirection="column">
          {toBlocks(e.props.text).map(b =>
            b.kind === 'code' ? (
              <Code source={b.source} language={b.lang} />
            ) : (
              line(Box, Text, b.text, b.isHeading)
            ),
          )}
        </Box>
      )
    } catch {
      return next(e)
    }
  })

  on('ui.render', { component: 'UserMessage' }, async ($, e, next) => {
    try {
      // Only the person's own prompts; notifications and agent messages keep the engine's row.
      if (e.props.task || e.props.from) return next(e)
      if ((await read($, isOff)) || !RTL.test(e.props.text)) return next(e)
      const { Box, Text } = $.ui.resolve(e)
      return (
        <Box flexDirection="column" borderStyle="round" paddingX={1}>
          {e.props.text.split('\n').map(t => line(Box, Text, t))}
        </Box>
      )
    } catch {
      return next(e)
    }
  })
}
