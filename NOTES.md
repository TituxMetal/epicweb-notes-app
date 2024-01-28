# Usefull Remix commands

Remix has a `remix` command line interface that can be used to run commands.

- To see all of the routes in the application, run `npx remix routes` command.

# Usefull Prisma commands

To initialize a Prisma project, run `npx prisma init --url file:./data.sqlite` command. By using the
--url flag, we're telling Prisma to create a SQLite database called data.sqlite in the prisma
directory.

After created a schema in schema.prisma, run `npx prisma db push` to push the schema to the database
and generate the Prisma Client.

Once the database is created, we can run `npx prisma studio` to open a GUI to interact with the
database.

We can also interact with the database using raw SQL with sqlite3 commands. For example we can
output a SQL file that represents the contents of the database and make a save of the database with
`sqlite3 prisma/data.sqlite .dump > data.sql`.

Use `npx prisma migrate dev --name "init"` command to create a migration file. By using the --name
flag, we're naming the migration file init. With `npx prisma migrate dev --create-only` command we
can create a migration file without running it. To just apply migrations in database,
`npx prisma migrate dev --skip-seed` command can be used, the --skip-seed flag will skip the seeding
of the database.

We can use `npx prisma migrate deploy` command to deploy the migrations on a production database. If
we want to completely reset the database, we can use `npx prisma migrate reset` command.
