## Configuring Postgres

Postgres works pretty hard to make itself usable right out of the box without you having to do anything. By default, it automatically creates the user `postgres`. Let’s see what other users it has created. Let’s start by using the `psql` utility, which is a utility installed with Postgres that lets you carry out administrative functions without needing to know their actual SQL commands.

Start by entering the following on the command line:

```
psql postgres
```



(You may need to use `sudo psql postgres` for this command to work, depending on how your system is configured).

You’ll see output like the following:

![image-20190321153128409](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153128409.png)

That’s the `psql` command line. We can now enter a command to see what users are installed:

```
postgres=# \du
```



Under the covers, this command executes an SQL query (we’ll learn about those later) that gets all the users in the database. On my machine, it returns the following:

![image-20190321153156551](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153156551.png)

We see the Postgres user I mentioned, but what is that other user, `engineerapart`? This is one of the things Postgres does to make your life easier when you first install it. On most Linux-based operating systems, the username that is used by default by all processes is the one you are logged in as. You don’t have to pass your username to most programs. But if a particular program, like Postgres, doesn’t have your username configured—it will fail!

So when Postgres is installed, it automatically creates a database user that matches your username, so that you can get started right away.

#### A. Creating Users

Postgres doesn’t actually directly manage users or groups, like most standard permission models do. Instead, it directly manages what it calls **roles**.

While it is certainly **convenient** that Postgres sets up a set of default users for you, it is a **very bad idea** to use them for anything except local development, because they are very widely known and more importantly, they are **super user** accounts—they can do anything, including delete databases. This is not safe for a production database—we need users with limited permissions. So how do we create and use new users (roles)?

There are two main ways to do this:

- Directly execute the `CREATE ROLE` SQL query on the database
- Use the `createuser` utility that comes installed with Postgres (which is just a wrapper for executing `CREATE ROLE`).

Let’s look at both cases.

#### A.1. `CREATE ROLE` with `psql`

The basic syntax for `CREATE ROLE` looks like this:

```
CREATE ROLE username WITH LOGIN PASSWORD 'quoted password' [OPTIONS]
```



Where `username` is the user you want to create, and the password goes at the end in quotes. We will get to the options later.

Let’s start by logging in again to our helpful `psql` tool:

![image-20190321153234362](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153234362.png)

While we’re in here, let’s set the password for the default `postgres` account—by default, it has no password.

```
postgres=# \password postgres
```



You will be prompted to enter the password and confirm it. Now let’s create our new role:

```
postgres=# CREATE ROLE patrick WITH LOGIN PASSWORD 'Getting started'; 
postgres=# \du
```



Your output should look like the following:

![image-20190321153258172](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153258172.png)

Wait. The attributes list for the user `patrick` is completely empty. Why?

This is how Postgres securely manages defaults. This user can read any database, table, or row it has permissions for, but nothing else—it cannot create or manage databases and has no admin powers. This is a good thing! It helps keep your database secure.

So let’s add the `CREATEDB` permission to our new user to allow them to create databases:

```
postgres=# ALTER ROLE patrick CREATEDB; 
postgres=# \du 
postgres=# \q # quits
```

Your output should like this:

![image-20190321153324077](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153324077.png)

[Documentation for `CREATE ROLE`](https://www.postgresql.org/docs/9.5/static/sql-createrole.html)

[Documentation for `ALTER ROLE`](https://www.postgresql.org/docs/9.5/static/sql-alterrole.html)

#### A.2. The `createuser` utility

Postgres ships with a number of very useful command line utilities that make the above process much easier. Instead of logging into psql, executing SQL queries, and needing to know the details of the query statements, you can use a familiar command line interface to do the same tasks. A few of these tools are:

- createuser: creates a user
- createdb: creates a database
- dropuser: deletes a user
- dropdb: deletes a database
- postgres: executes the SQL server itself (we saw that one above when we checked our Postgres version!)
- pg_dump: dumps the contents of a single database to a file
- pg_dumpall: dumps all databases to a file
- psql: we recognize that one!

[Full list of client applications](https://www.postgresql.org/docs/9.5/static/reference-client.html)

So let’s use `createuser` to do the same thing we did above: create the `patrick`user:

```
createuser patrick
```



This creates the user `patrick` with all of the default attributes, again, without the ability to create databases. If we wanted the ability to create a database, you would execute the following instead:

```
createuser patrick --createdb
```



Unfortunately, there is no command line tool to accomplish the same thing as ALTER ROLE. To change users after they are created, you must use `psql`.

[Documentation for `createuser`](https://www.postgresql.org/docs/9.5/static/app-createuser.html)

#### A.3. Summary

That’s it! Now our new user is set up and can create databases. Let’s start managing our database with that new user.

### B. Creating a Database

Just like creating a user, there are two ways to create a database:

- Executing SQL commands directly with psql
- The `createdb` command line utility.

#### B.1. `CREATE DATABASE` with `psql`

The core SQL syntax for creating a database in PostgreSQL is:

```
CREATE DATABASE databasename;
```



We’ll go through the same process as above:

```
psql postgres -U patrick
```

![image-20190321153408205](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153408205.png)

You’ll notice the prompt is slightly different – the `#` has changed to a `>`. This indicates you’re no longer using a Super User account.

```
postgres=> CREATE DATABASE super_awesome_application;
```



[Documentation for `CREATE DATABASE`](https://www.postgresql.org/docs/9.5/static/sql-createdatabase.html)

Once this is done, you need to add at least one user who has permission to access the database (aside from the super users, who can access everything). To do that, we’re going to learn a new SQL command:

```
postgres=> GRANT ALL PRIVILEGES ON DATABASE super_awesome_application TO patrick; postgres=> \list 
postgres=> \connect super_awesome_application 
postgres=> \dt 
postgres=> \q
```



[Documentation for `GRANT`](https://www.postgresql.org/docs/9.5/static/sql-grant.html)

Here, I have also shown you a few new commands that can be used with `psql`:

- `\list`: lists all the databases in Postgres
- `\connect`: connect to a specific database
- `\dt`: list the tables in the currently connected database

![image-20190321153435590](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153435590.png)

And that’s it.

You can now create, read, update and delete data on our `super_awesome_application` database with the user `patrick`!

#### B.2. The `createdb` Utility

As above, creating a database using `createdb` is simpler, with the caveat that you cannot manage the database after it is created. For that, `psql` is required.

```
createdb super_awesome_application -U patrick
```



Here, I have invoked the `createdb` utility and passed it the `patrick` user to use for connecting to the database. It is that user whose permissions will be checked to execute the create command.

It is very, very rare that you will want to change a database after it is created. The only things you can change are its name and some configuration parameters. Changing configuration parameters (such as collation or character sets) have implications that go far outside of this tutorial. However, we can change the name if we’d like.

Again, there is no command line tool to change a database once it’s created. We must use `psql`:

```
psql postgres -U patrick 
postgres=> ALTER DATABASE super_awesome_application RENAME TO even_more_awesome_application; 
postgres=> \q
```



And the output should be similar to:

![image-20190321153504266](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153504266.png)

[Documentation for `ALTER DATABASE`](https://www.postgresql.org/docs/9.5/static/sql-alterdatabase.html)

#### B.3. Summary

That’s it! We have created our user, created a database, and given the user permissions to use the database. Along the way, we learned to use some of the pre-installed Postgres command line tools. This will give us a great foundation for understanding more complex behavior in the next section.

Now let’s take a look at some popular graphical tools for managing PostgreSQL on MacOSX.

## IV. Popular GUIs for PostgreSQL on MacOSX

So far, we have focused pretty heavily on the command line tools for managing our Postgres installation. However, for some things, that is laborious and time-intensive: For example, if you want a quick view of the data you have in a table, getting that out of the command line tools takes more time than using a GUI. Do it 100 times a day while developing, that time starts to add up!

So naturally, a bunch of enterprising developers has built some pretty impressive GUIs that can be used to managed your local (and remote!) Postgres servers. We’ll take a look at a few of the most popular and user-friendly.

### 1. Postico (<https://eggerapps.at/postico/>)

Postico is a modern Postgres client for OSX, built by the same developer who built Postgres.app (mentioned above). It is free, but you can buy a license to unlock additional power features. This is the GUI that I use to manage Postgres because it is built specifically for Mac and has a beautiful, very easy to use (but powerful) UI. It also includes an SQL editor for complex queries.

To get started with Postico, simply:

- Download it at <https://eggerapps.at/postico/download/>
- Double-click the downloaded Zip file in Finder
- Drag the extracted `Postico.app` file to your Applications folder
- Find Postico in Launchpad and launch the app.

You’ll see a screen that looks like the following (without any database connections configured):

![image-20190321153604869](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153604869.png)

To connect to your local database:

- Click on ‘New Favorite’
- Give it an easy to remember name
- You can leave the default values entered in the boxes
- If you changed the `postgres` user password above, enter it in the password box
- Drop down the `Options` and select “Show All Databases” – otherwise you’ll wonder where your databases are!



![image-20190321153638944](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153638944.png)



- Click ‘Done’ to save it
- Then click the ‘Connect’ button.
- You’re done!

![image-20190321153655094](/Users/eddienaff/Library/Application Support/typora-user-images/image-20190321153655094.png)



Read the [Postico Documentation](https://eggerapps.at/postico/docs/v1.0.10/) to learn how to use Postico’s amazing features!