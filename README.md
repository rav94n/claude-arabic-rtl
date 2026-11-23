# arabic-rtl

Draws Arabic, Persian, Urdu and Hebrew messages right to left in Claude Code, in both your prompts and Claude's replies.
Messages with no right-to-left letters are left exactly as Claude Code draws them. Code blocks stay left to right.
Type `/rtl` to turn it off or on; the choice is remembered. If anything goes wrong while drawing a message, the mod
falls back to Claude Code's normal drawing, so it cannot stop the app from opening.

## Install

At the prompt of a Claude Code terminal session:

```
/plugin install arabic-rtl --marketplace rav94n/claude-arabic-rtl
```

Answer `y` to add the marketplace, then pick the user scope so it loads in every session.

From a shell:

```
claude plugin install arabic-rtl --marketplace rav94n/claude-arabic-rtl
```

In the desktop app: click + next to the prompt box, then Plugins, Add marketplace with `rav94n/claude-arabic-rtl`, then Add plugin.
