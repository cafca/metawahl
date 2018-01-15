#!/bin/bash

#
# METAWAHL DEPLOY SCRIPT
#
# This is a sample script, which can be adapted to be used for
# updating an existing metawahl installation by running just a single
# script.
#

git pull &&
git checkout master &&

cd client &&
npm run build &&

systemctl restart metawahl &&

rm -rf /var/www/metawahl/* &&
mv build/* /var/www/metawahl/ &&
rm -rf build &&
