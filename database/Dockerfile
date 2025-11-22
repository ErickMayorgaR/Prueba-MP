FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

# Instala herramientas necesarias
RUN apt-get update && apt-get install -y curl

COPY init.sql /tmp/init.sql
COPY stored-procedures.sql /tmp/stored-procedures.sql
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

USER mssql

CMD ["/bin/bash", "/entrypoint.sh"]