#!/bin/bash
set -e

echo "=========================================="
echo "Iniciando SQL Server..."
echo "=========================================="

# Inicia SQL Server y redirige logs a stdout
/opt/mssql/bin/sqlservr 2>&1 &
SQL_PID=$!

# Espera a que SQL Server este listo
echo "Esperando a que SQL Server acepte conexiones..."
for i in {1..60}; do
    if /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -C > /dev/null 2>&1; then
        echo "[OK] SQL Server esta listo (intento $i)"
        break
    fi
    echo "[WAIT] Esperando SQL Server... (intento $i/60)"
    sleep 2
done

# Verifica que SQL Server respondio
if ! /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT 1" -C > /dev/null 2>&1; then
    echo "[ERROR] SQL Server no respondio correctamente"
    exit 1
fi

echo ""
echo "=========================================="
echo "Ejecutando scripts de inicializacion..."
echo "=========================================="

# Ejecuta init.sql
echo "[SCRIPT] Ejecutando init.sql..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i /tmp/init.sql -C -b

if [ $? -eq 0 ]; then
    echo "[OK] init.sql ejecutado correctamente"
else
    echo "[ERROR] Error ejecutando init.sql"
    exit 1
fi

# Ejecuta stored-procedures.sql
echo ""
echo "[SCRIPT] Ejecutando stored-procedures.sql..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -i /tmp/stored-procedures.sql -C -b

if [ $? -eq 0 ]; then
    echo "[OK] stored-procedures.sql ejecutado correctamente"
else
    echo "[ERROR] Error ejecutando stored-procedures.sql"
    exit 1
fi

echo ""
echo "=========================================="
echo "[SUCCESS] Base de datos inicializada"
echo "=========================================="

# Verifica que DICRI_DB existe
echo ""
echo "[INFO] Verificando base de datos DICRI_DB..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -Q "SELECT name FROM sys.databases WHERE name = 'DICRI_DB'" -C

# Verifica tablas creadas
echo ""
echo "[INFO] Verificando tablas creadas..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -d DICRI_DB -Q "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES" -C

echo ""
echo "[INFO] SQL Server listo para recibir conexiones"
echo "=========================================="

# Mantiene SQL Server corriendo y muestra sus logs
wait $SQL_PID