#!/bin/sh

npm publish build  > npm-publish.log 2>&1
PUBLISH_EXIT_CODE=$?
echo $PUBLISH_EXIT_CODE
if [ $PUBLISH_EXIT_CODE = 0 ] ; then
  cat npm-publish.log
  echo "Successfully published"
  rm npm-publish.log
  exit 0
fi

cat npm-publish.log

if cat npm-publish.log | grep "code E403"; then
  echo "Not failing, just already existing"
  rm npm-publish.log
  exit 0
else
  echo "Failed publication"
  rm npm-publish.log
  exit 1
fi
