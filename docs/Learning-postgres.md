## postgres tutorial

http://www.postgresqltutorial.com/

## psql commands

\du show all users

\q exit

\dx show installed extensions

\df describe functions

LOGIN COMMANDS

psql -d mydb -U myuser
psql -h myhost -d mydb -U myuser

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
