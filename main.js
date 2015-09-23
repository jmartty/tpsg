//Variables globales
// Contexto webGL
var gl = null;
var canvas = null;
var programManager = null;
// Escena
var sceneGraph = null;
var cilinder = null;

// Clase ProgramManager
// Manejo de shaders y programs
function ProgramManager() {
    // Attribs
    this.programs = [];
    this.shaders = [];
    this.active = null;
    // Methods
    // Agregar y compilar un shader
    this.addShader = function(shaderid) {

        // Verificamos que no exista
        if(shaderid in this.shaders) {
            alert("Shader `" + shaderid + "` already exists!");
            return;
        }

        var shaderScript, src, currentChild, shader;

        // Obtenemos el elemento <script> que contiene el código fuente del shader
        shaderScript = document.getElementById(shaderid);
        if(!shaderScript) {
            alert("Elem `" + shaderid + "` not found");
            return null;
        }
        // Extraemos el contenido de texto del <script>
        src = "";
        currentChild = shaderScript.firstChild;
        while(currentChild) {
            if (currentChild.nodeType == currentChild.TEXT_NODE)
                src += currentChild.textContent;
            currentChild = currentChild.nextSibling;
        }
        // Creamos un shader WebGL según el atributo type del <script>
        if(shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }else if(shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }else{
            alert("Missing or invalid shader type");
            return;
        }
        // Cargamos el fuente y compilamos
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        // Chequeamos y reportamos si hubo algún error.
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            return;
        }
        // Cargamos el shader a la lista
        this.shaders[shaderid] = {}
        this.shaders[shaderid].id = shaderid;
        this.shaders[shaderid].shader = shader;

    }
    // Agregar y compilar un programa
    this.addProgram = function(programid, shaders) {
        this.programs[programid] = {}
        // Store program data
        this.programs[programid].id = programid;
        this.programs[programid].shaders = shaders;
        // Create program and attach+link
        this.programs[programid].program = gl.createProgram();
        shaders.forEach(function(s) {
            gl.attachShader(this.programs[programid].program, this.shaders[s].shader);
        }, this);
        gl.linkProgram(this.programs[programid].program);
        // Chequeamos y reportamos si hubo algún error.
        if(!gl.getProgramParameter(this.programs[programid].program, gl.LINK_STATUS)) {
          alert("Unable to initialize the shader program: " + gl.getProgramInfoLog(this.programs[programid].program));
          return null;
        }

    }
    // Activar un programa
    this.useProgram = function(program) {
        if(!(program in this.programs)) {
            alert("Program `" + program + "` not found!");
            return;
        }
        // Activar solo si no es el actual
        if(this.active != this.programs[program].program) {
            gl.useProgram(this.programs[program].program);
            this.active = this.programs[program].program;
        }
    }

    // Settear matrices de PVM al programa actual
    // No creo que cambie en ningun momento pero se podria parametrizar
    this.setProjectionMatrix = function() {
        var u_proj_matrix = gl.getUniformLocation(this.active, "uProjectionMatrix");
        var pMatrix = mat4.create();
        mat4.perspective(pMatrix, Math.PI/4, canvas.width/canvas.height, 0.1, 1000.0);
        gl.uniformMatrix4fv(u_proj_matrix, false, pMatrix);
    }

    // Debera tomar parametros eventualmente
    this.setViewMatrix = function() {
        var u_view_matrix = gl.getUniformLocation(this.active, "uViewMatrix");
        var vMatrix = mat4.create();
        mat4.lookAt(vMatrix, [35, 35, 35], [0, 0, 0], [0, 0, 1]);
        gl.uniformMatrix4fv(u_view_matrix, false, vMatrix);
    }

    // Lo carga cada modelo
    this.setModelMatrix = function(mMatrix) {
        if(mMatrix == null) var mMatrix = mat4.create();
        var u_model_matrix = gl.getUniformLocation(this.active, "uModelMatrix");
        gl.uniformMatrix4fv(u_model_matrix, false, mMatrix);
    }
}

// Clases para manejo de objetos en forma de grafo
// Clase especial de raiz del grafo
function SceneRoot() {
    // Array de childs
    this.children = [];
    // Attach elements to root
    this.attach = function (o) {
        this.children.push(o);
    }
    // Draw
    this.draw = function () {
        // El root no se dibuja, es un nodo especial
        //console.log("Drawing from root");
        this.children.forEach(function (child) {
            child.draw();
        });
    }
}

// Clase para cada elemento (nodo) de la escena
function SceneNode() {

    this.name = null;
    this.programid = null;
    this.children = [];
    // Model matrix
    this.mMatrix = mat4.create();
    // Buffers locales
    this.position_buffer = null;
    this.color_buffer = null;
    this.index_buffer = null;
    // Buffers GPU
    this.webgl_position_buffer = null;
    this.webgl_color_buffer = null;
    this.webgl_index_buffer = null;

    // Metodos
    // Ctor
    this.create = function(name, programid) {
        this.name = name;
        this.programid = programid;
    }
    // Translate
    this.translate = function(vec) {
        mat4.translate(this.mMatrix, this.mMatrix, vec);
    }
    // Scale
    this.scale = function(vec) {
        mat4.scale(this.mMatrix, this.mMatrix, vec);
    }
    // Rotate
    this.rotate = function(angle, axis) {
        mat4.rotate(this.mMatrix, this.mMatrix, Math.PI*angle/180.0, axis);
    }

    // Attach children to node
    this.attach = function (o) {
        this.children.push(o);
    }

    // These methods need to be overriden when deriving from this class
    // Local buffer setup
    this.setupModelData = function() {
        // Definir para cada nodo/elemento
        alert("No model vertex defined for " + this.name);
    }
    // Local buffer setup
    this.setupIndexBuffer = function() {
        // Definir para cada nodo/elemento
        alert("No index buffer defined for " + this.name);
    }
    // Local buffer setup
    this.setupGLBuffers = function() {
        // Definir para cada nodo/elemento
        alert("No GL buffers defined for " + this.name);
    }

    // Shader, buffer and attr setup
    this.setupShaders = function() {
        // Enable shader program
        programManager.useProgram(this.programid);
        // Setup uniforms
        programManager.setProjectionMatrix();
        programManager.setViewMatrix();
        programManager.setModelMatrix(this.mMatrix);
        // Enable each attribute (if gl buffer is set)
        // Position
        if(this.webgl_position_buffer) {
            var vertexPositionAttribute = gl.getAttribLocation(programManager.active, "aVertexPosition");
            gl.enableVertexAttribArray(vertexPositionAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
            gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
        }else{
            alert("No GL position buffer set for " + this.name);
        }
        // Color
        if(this.webgl_color_buffer) {
            var vertexColorAttribute = gl.getAttribLocation(programManager.active, "aVertexColor");
            gl.enableVertexAttribArray(vertexColorAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
            gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);
        }else{
            alert("No GL color buffer set for " + this.name);
        }
        // Indices
        if(this.webgl_index_buffer) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
        }else{
            alert("No GL index buffer set for " + this.name);
        }
    }

    // Draw node and children
    this.draw = function () {
        // Draw self
        //console.log("Drawing " + this.name);
        // Setup shaders, buffers and attributes
        this.setupShaders();
        // Draw self
        gl.drawElements(gl.TRIANGLE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
        // Delegate draw each child
        this.children.forEach(function (child) {
            child.draw();
        });
    }
}

// Clases de objetos a dibujar (derivadas de sceneNode)
// Cilindro
Cilinder = function() { }
Cilinder.prototype = new SceneNode()

Cilinder.prototype.setupModelData = function() {
    this.cols = 20;
    this.rows = 20;
    this.position_buffer = [];
    this.color_buffer = [];

    for (j = 0.0;j < this.rows; j++) {
        for (i = 0.0;i < this.cols; i++) {
           // Para cada vértice definimos su posición
           // Cilindro
           this.position_buffer.push(5.0*Math.cos(2.0*Math.PI*i/(this.cols-1)));
           this.position_buffer.push(5.0*Math.sin(2.0*Math.PI*i/(this.cols-1)));
           this.position_buffer.push(j);
           // Plano
           //this.position_buffer.push(i);
           //this.position_buffer.push(j);
           //this.position.buffer.push(0.0);

           // Para cada vértice definimos su color
           this.color_buffer.push(i/this.cols);
           this.color_buffer.push(j/this.rows);
           this.color_buffer.push(0.5);

       };
    };
}

Cilinder.prototype.setupIndexBuffer = function() {
    this.index_buffer = [];
    offset = 0;
    for(y = 0; y < this.rows-1; y++) {
        // Degenerate begin: repeat first vertex
        if (y > 0) {
            this.index_buffer[offset++] = y * this.cols;
        }

        // Draw one strip
        for (x = 0; x < this.cols; x++) {
            this.index_buffer[offset++] = (y * this.cols) + x;
            this.index_buffer[offset++] = ((y+1) * this.cols) + x;
        }

        // Degenerate end: repeat last vertex
        if (y < this.rows-2) {
            this.index_buffer[offset++] = ((y+1) * this.cols) + this.cols-1;
        }
    }
}

Cilinder.prototype.setupGLBuffers = function() {
    this.webgl_position_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position_buffer), gl.STATIC_DRAW);

    this.webgl_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color_buffer), gl.STATIC_DRAW);

    this.webgl_index_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index_buffer), gl.STATIC_DRAW);
}

// Funcion para inicializar el contexto webGL
function setupWebGL() {
    // Setup canvas
    canvas = document.getElementById("my-canvas");
    try{
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if(!gl) {
            alert("Error: Your browser does not appear to support WebGL.");
            return;
        }
    }catch(e){
        alert("Error: canvas.getContext()");
    }
    // Other gl settings
    gl.clearColor(0.1, 0.1, 0.2, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// Funcion general de dibujado
function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    cilinder.rotate(1.0, [document.getElementById('x').value, document.getElementById('y').value, document.getElementById('z').value]);
    sceneRoot.draw();
}

function main() {
    // Setup webGL and canvas
    setupWebGL();
    // Load shaders and programs
    programManager = new ProgramManager();
    // Add shaders from <script>
    programManager.addShader("default-vs");
    programManager.addShader("default-fs");
    // Create programs with shaders
    programManager.addProgram("default", ["default-vs", "default-fs"]);
    // Enable default program
    programManager.useProgram("default");

    // Setup de la escena
    sceneRoot = new SceneRoot();

    // Creacion de instancias de modelos
    cilinder = new Cilinder();
    cilinder.create("cilinder", "default");
    cilinder.setupModelData();
    cilinder.setupIndexBuffer();
    cilinder.setupGLBuffers();

    // Construimos la escena
    sceneRoot.attach(cilinder);

    // Draw
    //drawScene();
    setInterval(drawScene, 16);

}

