# backend

contains all services that can run independently even on different machines ie
- search
- checkout

services can also be shared between other services 
- databases
- auth
to avoid to many chained requests they are bundle together
because they are often mainly just calls to a database ie
- product
- user

