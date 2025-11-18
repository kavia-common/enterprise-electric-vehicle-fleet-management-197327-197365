#!/bin/bash
cd /home/kavia/workspace/code-generation/enterprise-electric-vehicle-fleet-management-197327-197365/iot_ev_fleet_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

