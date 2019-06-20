#!/bin/bash
SCHEMA="com.benjuan26.soundswitch"
KEY=device

CURRENT_DEVICE=$(gsettings get ${SCHEMA} ${KEY})

if [ "$CURRENT_DEVICE" = "'analog-output-lineout'" ]; then
	echo "first one"
	gsettings set ${SCHEMA} ${KEY} "analog-output-headphones"
else
	echo "second one"
	gsettings set ${SCHEMA} ${KEY} "analog-output-lineout"
fi
