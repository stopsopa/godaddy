
export NODE_ENV="$1"

TEST="^(production|development)$"

if ! [[ $NODE_ENV =~ $TEST ]]; then

    echo "$0 error: script argument 1 ($1) don't match ${TEST}"

    exit 1;
fi

set -x
set -e

_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

if [ "$NODE_ENV" = "production" ]; then

  node server.js

else

  nodemon --ignore public/dist --ignore var -- server.js
fi

