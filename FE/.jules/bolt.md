## 2024-05-22 - Environment specific package-lock.json noise
**Learning:** Running `npm install` in this environment modifies `package-lock.json` by removing `peer: true` from dependencies, creating noise in PRs.
**Action:** Always revert `package-lock.json` after `npm install` if no packages were explicitly added/removed.
