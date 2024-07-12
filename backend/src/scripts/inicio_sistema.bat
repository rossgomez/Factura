
Si deseas que el script se ejecute en segundo plano sin cerrar la ventana de la consola, puedes agregar start antes de cada comando para que se inicie en un nuevo proceso. Aquí tienes una versión modificada del script:

batch
Copy code
@echo off
set REPO_DIR=C:\Repo\Facturacion
set LOG_PATH=C:\Repo\.facturacion.log

cd %REPO_DIR%

start "" git pull origin master

cd frontend
start "" yarn build

cd ..\backend

start "" node src\server.js


