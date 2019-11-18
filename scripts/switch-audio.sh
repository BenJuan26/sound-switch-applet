#!/bin/bash
SCHEMA="com.benjuan26.soundswitch"
KEY=device

CURRENT_DEVICE=$(gsettings get ${SCHEMA} ${KEY})

if [ "$CURRENT_DEVICE" = "'analog-output-lineout'" ]; then
	gsettings set ${SCHEMA} ${KEY} "analog-output-headphones"
else
	gsettings set ${SCHEMA} ${KEY} "analog-output-lineout"
fi
