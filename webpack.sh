
export NODE_ENV="$1"

TEST="^(production|development)$"

if ! [[ $NODE_ENV =~ $TEST ]]; then

    echo "$0 error: script argument 1 ($1) don't match ${TEST}"

    exit 1;
fi

_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

if ! [ -f "$_ROOT/.env" ]; then

  cp "$_ROOT/.env.dist" "$_ROOT/.env"
fi

if ! [ -f "$_ROOT/.env" ]; then

  echo "$_ROOT/.env doesn't exist"

  exit
fi

function clean {

  cd "$_ROOT"
}

trap clean EXIT;

set -x
set -e

(
  cd "$_ROOT/public"
  if [ -e public ]; then echo 'dist symlink already exist'; else ln -s ../node_modules public; fi
)

mkdir -p override

node webpack/buildtimer.js

node webpack/preprocessor.js

if [ "$NODE_ENV" = "production" ]; then

  node node_modules/.bin/webpack
else

  node node_modules/.bin/webpack --watch
fi





