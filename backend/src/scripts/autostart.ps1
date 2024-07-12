# Reemplaza estas variables con tus valores
$REPO_DIR = "C:\Repo\Facturacion"
$LOG_PATH = "C:\Repo\.facturacion.log"


# Cambia al directorio del repositorio
cd $REPO_DIR

# Actualiza el repositorio usando Git
#git pull origin master

# Haz build del frontend
cd frontend
yarn build

# Cambia al directorio del backend
cd ..\backend

# Respaldar base de datos


# Levantar el servidor
node src\server.js

# Regresa al directorio original
#cd $PSScriptRoot

# Redirige la salida al archivo de registro
#Start-Transcript -Path $LOG_PATH -Append

# Fin del script

