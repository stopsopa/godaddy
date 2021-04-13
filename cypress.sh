
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P )"

if [ ! -f "$DIR/cypress.json" ]; then

  echo "You should run this command from directory with cypress.json file in it"

  exit 1
fi

if [ ! -f "$DIR/bash/exportsource.sh" ]; then

  echo "$DIR/bash/exportsource.sh doesn't exist"

  exit 1
fi

if [ ! -f "$DIR/bash/node/json/get.js" ]; then

  echo "$DIR/bash/node/json/get.js doesn't exist"

  exit 1
fi

function star {
  echo "$1" | sed -E "s/:star:/*/g"
}

if [ "$1" = "" ]; then

  echo "Specify location to env file as a first argument"

  echo "present env files are:"

  ls .env*

cat << EOF

More help:

# local dev
/bin/bash $0 .env.gh

# CI/CD environment
/bin/bash $0 .env.gh docker -- /bin/bash $0 .env.gh
  # run tests using $0 inside container - to properly read given .env file inside

just provide .env file with CYPRESS_BASE_URL like:
  CYPRESS_BASE_URL=https://stopsopa.github.io/cypress-research

# other useful
/bin/bash $0 .env.gh docker -- /bin/bash
/bin/bash $0 .env.gh docker -- ls -la
/bin/bash $0 .env.gh docker -- /bin/bash $0 .env.gh -- sypress run --spec cypress/integration/homepage.spec.js
    # more about cli parameters: https://docs.cypress.io/guides/references/configuration/#Command-Line

/bin/bash $0 .env.gh docker -- /bin/bash $0 .env.gh -- sypress run -C cypress-docker.json
    # more about json configuration: https://docs.cypress.io/guides/references/configuration

    cypress-docker.json
    {
        "video": false,
        "ignoreTestFiles": "*.spec.js"
    }
    # read more: https://docs.cypress.io/guides/references/configuration/#Folders-Files

EOF

  exit 1
fi

if [ ! -f "$1" ]; then

  echo "env file '$1' is not a file"

  exit 1
fi

_ENVFILE="$1"

shift;

_DOCKER="0"

if [ "$1" = "docker" ]; then

  shift;

  _DOCKER="1"
fi

PARAMS=""
REST=""
_EVAL=""
while (( "$#" )); do
  case "$1" in
    --) # end argument parsing
      shift;
#      while (( "$#" )); do          # optional
#        if [ "$1" = "&&" ]; then
#          REST="$REST \&\&"
#        else
#          if [ "$REST" = "" ]; then
#            REST="\"$1\""
#          else
#            REST="$REST \"$1\""
#          fi
#        fi
#        shift;                      # optional
#      done                          # optional if you need to pass: /bin/bash $0 -f -c -- -f "multi string arg"
      break;
      ;;
    -*|--*=) # unsupported flags
      echo "$0 Error: Unsupported flag $1" >&2
      exit 1;
      ;;
    *) # preserve positional arguments
      if [ "$1" = "&&" ]; then
          PARAMS="$PARAMS \&\&"
      else
        if [ "$PARAMS" = "" ]; then
            PARAMS="\"$1\""
        else
          PARAMS="$PARAMS \"$1\""
        fi
      fi
      shift;
      ;;
  esac
done

trim() {
    local var="$*"
    # remove leading whitespace characters
    var="${var#"${var%%[![:space:]]*}"}"
    # remove trailing whitespace characters
    var="${var%"${var##*[![:space:]]}"}"
    echo -n "$var"
}

PARAMS="$(trim "$PARAMS")"

FINAL="$@"
if [ "$FINAL" = "" ]; then

  FINAL="cypress run"
fi

#eval set -- "$PARAMS"

#echo "\$PARAMS=$PARAMS"
#
#echo "\$REST=$REST"
#
#echo "\$@=$@"
#
#echo "\$FINAL=$FINAL"
#
##
#exit 0
##
##

#function cleanup {
#
#    echo "cleanup"
#
#    chmod -R a+w cypress
#}
#
#trap cleanup EXIT


set -e
#set -x

if [ "$_DOCKER" = "1" ]; then

  set -x

  VER="$(node bash/node/json/get.js package.json devDependencies.cypress)"

  if [ "$?" != "0" ]; then

    echo "$0 error: node bash/node/json/get.js package.json devDependencies.cypress returned non 0 exit code"

    exit 1
  fi

  if [ "$VER" = "undefined" ]; then

    VER="$(node bash/node/json/get.js package.json dependencies.cypress)"
  fi

  if [ "$VER" = "undefined" ]; then

    echo "$0 error: couldn't extract VER"

    exit 1
  fi

  # console.log('^6.8.0'.replace(/^[^\d]*(.*)$/, '$1'))
  VER="$(echo "console.log('$VER'.replace(/^[^\d]*(.*)\$/, '\$1'))" | node)"

  # https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command/#header
  # https://mtlynch.io/painless-web-app-testing/
  # https://glebbahmutov.com/blog/run-cypress-included-from-docker-container/

  echo -e "\n    docker run -it -v \"$DIR:/e2e\" -w /e2e --env __DOCKER=true --entrypoint=\"\" cypress/included:$VER $FINAL\n"

                 docker run -it -v "$DIR:/e2e"   -w /e2e --env __DOCKER=true --entrypoint=""   cypress/included:$VER $FINAL

#  echo -e "\n    docker run -it -v \"$DIR:/e2e\" -w /e2e --env-file \"$_ENVFILE\" --entrypoint=\"\" cypress/included:6.6.0 $FINAL\n"
#
#                 docker run -it -v "$DIR:/e2e"   -w /e2e --env-file "$_ENVFILE"   --entrypoint=""   cypress/included:6.6.0 $FINAL
else

  eval "$(/bin/bash "$DIR/bash/exportsource.sh" "$_ENVFILE")"

  REG="^https?://"

  if [[ ! $CYPRESS_BASE_URL =~ $REG ]]; then

    echo "CYPRESS_BASE_URL doesn't match $REG - first test"

    echo "attempt to assemble"

    if [ "$PORT" = "" ]; then

      echo "PORT is not defined"

      exit 1
    fi

    if [ "$HOST" = "" ]; then

      echo "HOST is not defined"

      exit 1
    fi

    if [ "$PROTOCOL" = "" ]; then

      echo "PROTOCOL is not defined"

      exit 1
    fi

    CYPRESS_BASE_URL="$PROTOCOL://$HOST:$PORT"

    echo "CYPRESS_BASE_URL=$CYPRESS_BASE_URL"
  fi

  if [[ ! $CYPRESS_BASE_URL =~ $REG ]]; then

    echo "CYPRESS_BASE_URL doesn't match $REG - second test"

    exit 1
  fi

  export CYPRESS_BASE_URL;

  # https://docs.cypress.io/guides/guides/environment-variables.html

  #echo "$CYPRESS_BASE_URL"

  if [ "$__DOCKER" = "true" ]; then

    echo ">>>$(star "$FINAL")<<<"

    eval $(star "$FINAL")
  else

    "$DIR/node_modules/.bin/cypress" open
  fi

fi