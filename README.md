
# Install

Just follow Makefile:
For dev just run:


    git clone git@github.com:stopsopa/godaddy.git
    cd godaddy/    
    yarn

Then run in two terminals:

    make  webpackdev

Then in second terminal
    
    make serverdev


Then visit: http://0.0.0.0:8080

Then you can run some tests too

	/bin/bash test.sh
        # will run jest tests and 
	/bin/bash cypress.sh .env