import re
import os

files = ['audio.js', 'level.js', 'player.js', 'enemy.js', 'quiz.js', 'ui.js', 'main.js']
content = ['/** Xazina Ovchisi - Standalone Fallback Bundle for direct file:// launch **/']
content.append('(function() {')
content.append('"use strict";')

for f in files:
    path = os.path.join('js', f)
    with open(path, 'r', encoding='utf-8') as src:
        text = src.read()
        # Remove import statements
        text = re.sub(r'import\s+.*?from\s+[\'\"].*?[\'\"];?\n?', '', text)
        # Remove export statements: 'export const X =', 'export class X {', 'export default', etc.
        text = re.sub(r'export\s+(const|class|let|var|function)', r'\1', text)
        text = re.sub(r'export\s+default\s+', '', text)
        content.append(f'\n/* ==================== Module: {f} ==================== */\n')
        content.append(text)

content.append('\n})();')

bundle_code = '\n'.join(content)
with open('js/game-bundle.js', 'w', encoding='utf-8') as out:
    out.write(bundle_code)

print(f"Generated js/game-bundle.js successfully! Size: {len(bundle_code)} bytes")
