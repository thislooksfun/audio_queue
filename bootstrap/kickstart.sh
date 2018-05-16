#!/bin/bash

set -e

BRANCH="master"

BYPASS=0
if [ $# -gt 0 ] ; then
  echo $#
fi

exists() { command -v $1 1>/dev/null; }
errcho() { >&2 echo "$1"; }
run_bt_script() { curl -sSL "http://github.com/thislooksfun/audio_queue/blob/$BRANCH/bootstrap/$1" | bash }

if ! exists curl ; then
  errcho ""
  errcho "ERROR: Could not find cURL!"
  errcho "  Please install cURL and ensure that your PATH"
  errcho "  is set correctly, then run this command again."
  errcho ""
  exit 1
fi


if ! exists git ; then
  echo "No git"
  # install git
  run_remote "install/git.sh"
fi


if ( ! exists node ) || ( ! exists npm ) ; then
  echo "No node"
  # install node
  run_remote "install/node.sh"
fi


# Clone and

# Install FF + deps