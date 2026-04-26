#!/bin/bash

case $LANGUAGE in
  python)
    timeout 30 python3 -c "$CODE"
    ;;
  javascript)
    timeout 30 node -e "$CODE"
    ;;
  java)
    echo "$CODE" > Main.java
    if javac Main.java; then
      timeout 30 java Main
    else
      echo "Compilation failed" >&2
      exit 1
    fi
    ;;
  *)
    echo "Unsupported language"
    exit 1
    ;;
esac