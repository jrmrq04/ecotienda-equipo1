<h1>Como ejecutar la página de ElectroVerde</h1>

<p>Antes de ejecutar se necesita cumplir con estos requisitos:</p>

<h2>Requisitos</h2>

<p>- Visual Studio Code en su última versión</p>
<p>- Extensión Live Server instalado</p>
<p>- Node.js con npm en sus últimas versiónes</p>

<h2>Pasos para ejecutar</h2>

<h3>Paso 1.</h3>

<p>Descargar el código fuente</p>

<h3>Paso 2.</h3>

<p>Instalar node_modules en la carpeta del API del proyecto:</p>
<p>Entrando a Node.js command prompt, se usan los siguientes comandos:</p>

<p><strong>1° comando:</strong></p>

<p>cd "Ruta del proyecto sin las comillas"/api</p>

<p><strong>2° comando:</strong></p>

<p>npm install</p>

<h3>Paso 3.</h3>

<p>Crear la base de datos en ahí mismo usando el comando:</p>

<p>npm run crear-bd</p>

<h3>Paso 4.</h3>

<p>Levantar el API usando el comando:</p>

<p>npm run dev</p>

<p>Esto levantará el API con http://localhost:3001</p>
<p>Si se cierra la ventana, el API se detiene</p>

<h3>Paso 5.</h3>

<p>Abrir Visual Studio Code</p>

<p>Se abre VS Code con la extensión Live Server instalado.</p>
<p>Despúes seleccionar la carpeta raíz del proyecto en File > Open Folder</p>
<p>Por último hacer clic en el botón Go Live e iniciará el servidor local y se abrirá automáticamente la página en el navegador predeterminado</p>
