#!/bin/bash

MAGENTA="\033[35m"
GREEN="\033[32m"
GREEN_BLOCK="\033[42m"
BLUE="\033[96m"
RED="\033[91m"
RED_BLOCK="\033[41m"
YELLOW="\033[93m"
DEFAULT="\033[39m"
RESET_BLOCK="\033[0m"


STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep ".jsx\{0,1\}$\|.json$")
ESLINT="$(git rev-parse --show-toplevel)/node_modules/.bin/eslint"

if [ "$STAGED_FILES" = "" ] ; then
  exit 0
fi

PASS=true

printf "\nValidating Javascript:\n"

# Check for eslint
if [ ! -x "$ESLINT" ]; then
  printf "\t$MAGENTA Please install ESlint $DEFAULTy (yarn install)"
  exit 1
fi

for FILE in $STAGED_FILES
do
  "$ESLINT" "$FILE"

  if [ $? -eq 0 ]; then
    printf "\t$GREEN ESLint Passed: $FILE $DEFAULT"
  else
    printf "\t$RED ESLint Failed: $FILE $DEFAULT"
    PASS=false
  fi
done

printf "\nJavascript validation completed!\n\n"

if ! $PASS; then
  printf "$RED_BLOCK COMMIT FAILED:$RESET_BLOCK Your commit contains files that should pass ESLint but do not. Please fix the ESLint errors and try again.\n"
  exit 1
else
  printf "$GREEN_BLOCK COMMIT SUCCEEDED$RESET_BLOCK\n"
fi

exit $?

