#!/bin/ash

if [ $STARTUP_DELAY ]; then
  echo "SLEEPING FOR $STARTUP_DELAY SECONDS..."
  sleep $STARTUP_DELAY
fi

npx prisma generate
npx prisma db push --accept-data-loss

if [ ! -f ".initial_setup" ]; then
  touch ".initial_setup"
  echo "performed initial setup..."
fi

npm run dev
