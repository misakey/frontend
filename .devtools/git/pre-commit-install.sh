#!/bin/sh

PREPUSH_SCRIPT=hook--pre-commit.sh
PREPUSH_FOLDER=devtools/git
HOOK_NAME=pre-commit

HOOKS_FOLDER=.git/hooks

PROJECT_ROOT_FOLDER="$(git rev-parse --show-toplevel)"

cd $PROJECT_ROOT_FOLDER/$HOOKS_FOLDER

# 1. add shebang to hook script
echo "#!/bin/sh" > $HOOK_NAME

# # 2. add script execution to hook script
echo "sh $PROJECT_ROOT_FOLDER/$PREPUSH_FOLDER/$PREPUSH_SCRIPT" >> $HOOK_NAME
chmod 755 $HOOK_NAME

echo "Precommit hook install."
