#!/bin/bash
# -------------------------------------------------------------------------
rm package*
npm init
# npm init creates a package.json
# http://browsenpm.org/package.json
# https://docs.npmjs.com/files/package.json
# Take the defaults here

# add libraries to local node_modules

npm install express
npm install pg

# check out the package.json now
# check out node_modules

# psql "dbname='webdb' user='webdbuser' password='password' host='localhost'" -f db/schema.sql
