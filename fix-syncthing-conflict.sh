git stash push -m "保存未提交的更改"
git fetch origin
git reset --hard origin/main
git stash pop