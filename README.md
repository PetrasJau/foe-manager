Forge of Empires Manager

Adds helper methods to make the game better.

Currently only mozilla firefox is supported.

Installation:
1. get Greasemonkey plugin for firefox
2. add foe-manager.user.js

Usage:
Currently only one function is implemented - skip to your wanted recurring quest:
1. open quest tab
2. open developer tools (shortcut: Ctrl+Shift+I for developer tools)
3. open console tab
4. enter `skipUntil('Unbirthday Party', 1)` where `Unbirthday Party` is the title of the quest you want and `1` is index position of the quest in quest tracker (put `1` if you have 2 quest slots, `2` if you have 3).

Keep in mind that new quests are appearing at the bottom, so if your quest you want to cycle is at the top, make sure you abort it once first.
