// Clase ProgramManager
// Manejo de shaders y programs
function ProgramManager() {
    // Attribs
    this.programs = [];
    this.shaders = [];
    this.active = null;
    
    this.vMatrix = null;
    this.pMatrix = null;
    
    // Methods
    // Agregar y compilar un shader
    this.addShader = function(shaderid) {

        // Verificamos que no exista
        if(shaderid in this.shaders) {
            alert("Shader `" + shaderid + "` already exists!");
            return;
        }

        var shaderScript, src, shader;

        // Obtenemos el elemento <script> que contiene el código fuente del shader
        shaderScript = document.getElementById(shaderid);
        if(!shaderScript) {
            alert("Elem `" + shaderid + "` not found");
            return;
        }
        // Extraemos el contenido de texto del <script>
        src = shaderScript.text;

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
        this.pMatrix = mat4.create();
        mat4.perspective(this.pMatrix, Math.PI/4, canvas.width/canvas.height, 0.1, 100.0);
        //mat4.ortho(pMatrix, -1.0, 1.0, -1.0, 1.0, -10, 100.0);
        gl.uniformMatrix4fv(u_proj_matrix, false, this.pMatrix);
        return this.pMatrix;
    }

    // Debera tomar parametros eventualmente si se puede cambiar la camara
    this.setViewMatrix = function() {
        var u_view_matrix = gl.getUniformLocation(this.active, "uViewMatrix");
        gl.uniformMatrix4fv(u_view_matrix, false, this.vMatrix);
        return this.vMatrix;
    }
    
    this.updateViewMatrix = function(viewMatrix) {
        this.vMatrix = viewMatrix;
    }

    // Lo carga cada modelo
    this.setModelMatrix = function(mMatrix) {
        var u_model_matrix = gl.getUniformLocation(this.active, "uModelMatrix");
        gl.uniformMatrix4fv(u_model_matrix, false, mMatrix);
        return mMatrix;
    }
    // Matriz de normales para iluminacion
    this.setNormalMatrix = function(mMatrix) {
        var nMatrix = mat3.create();
        mat3.normalFromMat4(nMatrix, mMatrix);
        var u_normal_matrix = gl.getUniformLocation(this.active, "uNormalMatrix");
        gl.uniformMatrix3fv(u_normal_matrix, false, nMatrix);
        return nMatrix;
    }
}

// Clases para manejo de objetos en forma de grafo
// Clase especial de raiz del grafo
function SceneRoot() {
    // Array de childs
    this.children = [];
    // Attach elements to root
    this.attachChild = function (o) {
        o.parent = this;
        this.children.push(o);
    }
    // Identity via null
    this.getModelMatrix = function() {
        return null;
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
    this.children = null;
    this.lights = null;
    this.parent = null;
    // Model matrix
    this.mMatrix = null;
    
    // Buffers locales
    this.position_buffer = null;
    this.normal_buffer = null;
    this.color_buffer = null;
    this.index_buffer = null;
    this.draw_mode = null; //triangle strip, etc
    // Buffers GPU
    this.webgl_position_buffer = null;
    this.webgl_normal_buffer = null;
    this.webgl_color_buffer = null;
    this.webgl_index_buffer = null;

    // Metodos
    // Ctor
    this.create = function(name, programid) {
        this.name = name;
        this.programid = programid;
        this.mMatrix = mat4.create();
        this.children = [];
        this.lights = [];
        this.draw_mode = gl.TRIANGLE_STRIP;
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
    // Reset model matrix to identity
    this.reset = function() {
        this.mMatrix = mat4.create();
    }

    // Attach children to node
    this.attachChild = function(o) {
        o.parent = this;
        this.children.push(o);
    }

    // Get model matrix multiplied with the parents recursively
    this.getModelMatrix = function() {
        var tmpMat = mat4.clone(this.mMatrix);
        if (this.parent.getModelMatrix() != null) {
            mat4.multiply(tmpMat, this.parent.getModelMatrix(), tmpMat);
        }
        return tmpMat;
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
        if(this.position_buffer) {
            this.webgl_position_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position_buffer), gl.STATIC_DRAW);
        }
        if(this.normal_buffer) {
            this.webgl_normal_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normal_buffer), gl.STATIC_DRAW);
        }
        if(this.color_buffer) {
            this.webgl_color_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_color_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color_buffer), gl.STATIC_DRAW);
        }
        if(this.index_buffer) {
            this.webgl_index_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index_buffer), gl.STATIC_DRAW);
        }
    }

    // Shader, buffer and attr setup
    this.setupShaders = function(modelMatrix) {
        // Enable shader program
        programManager.useProgram(this.programid);
        // Setup uniforms
        programManager.setProjectionMatrix();
        programManager.setViewMatrix();
        programManager.setModelMatrix(modelMatrix);
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
        // Normals (optional)
        if(this.webgl_normal_buffer) {
            // Load normals
            var vertexNormalAttribute = gl.getAttribLocation(programManager.active, "aVertexNormal");
            gl.enableVertexAttribArray(vertexNormalAttribute);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_normal_buffer);
            gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
            // Load normal's matrix
            programManager.setNormalMatrix(modelMatrix);
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
        // Draw self (ignore if no buffer has been set)
        if(this.programid != null) {
            //console.log("Drawing " + this.name);
            // Setup shaders, buffers and attributes
            this.setupShaders(this.getModelMatrix());
            gl.drawElements(this.draw_mode, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
        }
        // Delegate draw each child
        this.children.forEach(function (child) {
            child.draw();
        }, this);
    }
}

// Clases de objetos a dibujar (derivadas de sceneNode)
// Grilla de cols*rows
// cols = divisiones de cada corte
// rows = # extrusion steps
Grid = function() { }
Grid.prototype = new SceneNode();

Grid.prototype.setupModelData = function(cols, rows, color) {
    this.cols = cols;
    this.rows = rows;

    this.position_buffer = [];
    this.normal_buffer = [];
    this.color_buffer = [];

    for (j = 0.0;j < this.rows; j++) {
        for (i = 0.0;i < this.cols; i++) {
            // Para cada vértice definimos su posición
            // Plano
            this.position_buffer.push(i/(this.cols-1));
            this.position_buffer.push(j/(this.rows-1));
            this.position_buffer.push(0.0);
            
            this.normal_buffer.push(0.0);
            this.normal_buffer.push(0.0);
            this.normal_buffer.push(1.0);

            // Para cada vértice definimos su color
            this.color_buffer.push(color[0]);
            this.color_buffer.push(color[1]);
            this.color_buffer.push(color[2]);

       };
    };
}

Grid.prototype.setupIndexBuffer = function() {
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

// Poligono plano de n esquinas
// Toma los n vertices [(x,y), ... n] en el plano Z
Poligon = function() { }
Poligon.prototype = new SceneNode();

Poligon.prototype.setupModelData = function(verts, color) {

    this.position_buffer = [];
    this.normal_buffer = [];
    this.color_buffer = [];

    for (i = 0.0;i < verts.length; i++) {
		// Para cada vértice definimos su posición
		// Plano
		this.position_buffer.push(verts[i][0]);
		this.position_buffer.push(verts[i][1]);
		this.position_buffer.push(0.0);
		
		this.normal_buffer.push(0.0);
		this.normal_buffer.push(0.0);
		this.normal_buffer.push(1.0);

		// Para cada vértice definimos su color
		this.color_buffer.push(color[0]);
		this.color_buffer.push(color[1]);
		this.color_buffer.push(color[2]);

    };
	
	this.draw_mode = gl.TRIANGLE_FAN;
	
}

Poligon.prototype.setupIndexBuffer = function() {
    this.index_buffer = [];
    for(i = 0; i < this.position_buffer.length/3; i++) {
		this.index_buffer.push(i);
    }
}


// Cilindro
Cylinder = function() { }
Cylinder.prototype = new Grid();
// Redefinimos los metodos de datos propios de la figura
Cylinder.prototype.setupModelData = function(cols, rows, color) {
    this.cols = cols;
    this.rows = rows;

    this.position_buffer = [];
    this.normal_buffer = [];
    this.color_buffer = [];

    for (j = 0.0;j < this.rows; j++) {
        for (i = 0.0;i < this.cols; i++) {

            // Cilindro
            this.position_buffer.push(0.5*Math.cos(2.0*Math.PI*i/(this.cols-1)));
            this.position_buffer.push(0.5*Math.sin(2.0*Math.PI*i/(this.cols-1)));
            this.position_buffer.push(j/(this.rows-1));

            this.normal_buffer.push(Math.cos(2.0*Math.PI*i/(this.cols-1)));
            this.normal_buffer.push(Math.sin(2.0*Math.PI*i/(this.cols-1)));
            this.normal_buffer.push(0.0);
            
            this.color_buffer.push(color[0]);
            this.color_buffer.push(color[1]);
            this.color_buffer.push(color[2]);

       };
    };
}

// Cilindro
ExtrusionSurface = function() { }
ExtrusionSurface.prototype = new Grid();
// cutVerts = array of vertices (2d) in the XY plane definining the cut
// curve = f(u), R->R^3
// curveD = f'(u), derivative of f(u)
// steps = number of divisions of paramter u
ExtrusionSurface.prototype.setupModelData = function(cutVerts, cutNormals, color, curve, curveD, steps) {
    // Connect last with first
    cutVerts.push(cutVerts[0]);
    cutNormals.push(cutNormals[0]);
    
    this.cols = cutVerts.length;
    this.rows = steps;

    this.position_buffer = [];
    this.normal_buffer = [];
    this.color_buffer = [];
    
    var localMat = mat4.create();
    
    for (j = 0.0;j < steps;j++) {
        
        var pos = curve(j/(steps-1));
        var tg = curveD(j/(steps-1));
        
        vec3.normalize(tg, tg);
        var up = [0, 0, 1];
        var left = [];
        vec3.cross(left, up, tg);
        vec3.normalize(left, left);
        vec3.cross(up, tg, left);

        mat4.identity(localMat);
        mat4.translate(localMat, localMat, pos);
        mat4.multiply(localMat, localMat, [].concat(
          left, [0],
          up, [0],
          tg, [0],
          [0, 0, 0, 1]
        ));
        
        var normalMat = mat3.create();
        mat3.normalFromMat4(normalMat, localMat);
        
        for (i = 0.0;i < cutVerts.length; i++) {
            // Para cada vértice definimos su posición
            var vec = [];
            vec3.transformMat4(vec, cutVerts[i].concat(0), localMat);
            this.position_buffer = this.position_buffer.concat(vec);
            
            vec3.transformMat3(vec, cutNormals[i].concat(0), normalMat);
            this.normal_buffer = this.normal_buffer.concat(vec);
            
            this.color_buffer.push(color[0]);
            this.color_buffer.push(color[1]);
            this.color_buffer.push(color[2]);

       }
    }
}

// Curva
Curve = function() { }
Curve.prototype = new SceneNode();
// cutVerts = array of vertices (2d) in the XY plane definining the cut
// curve = f(u), R->R^3
// curveD = f'(u), derivative of f(u)
// steps = number of divisions of paramter to u
Curve.prototype.setupModelData = function(curve, steps) {
    this.steps = steps;
    this.draw_mode = gl.LINE_STRIP;
    
    this.position_buffer = [];
    this.color_buffer = [];
    
    for (j = 0.0;j < steps;j++) {
        var pos = curve(j/(steps-1));
        this.position_buffer = this.position_buffer.concat(pos);
        this.color_buffer = this.color_buffer.concat([0.0, 1.0, 0.0]);
    }
}

Curve.prototype.setupIndexBuffer = function() {
    this.index_buffer = [];

    for(i = 0; i < this.steps; i++) {
        this.index_buffer.push(i);
    }
}

// Circle uses center + TRIANGLE_FAN 
Circle = function() { }
Circle.prototype = new SceneNode();

Circle.prototype.setupModelData = function(steps, color) {
    this.steps = steps;
    this.draw_mode = gl.TRIANGLE_FAN;
    
    this.position_buffer = [];
    this.color_buffer = [];
    this.normal_buffer = []

    // Center
    this.position_buffer.push(0.0);
    this.position_buffer.push(0.0);
    this.position_buffer.push(0.0);

    this.normal_buffer.push(0.0);
    this.normal_buffer.push(0.0);
    this.normal_buffer.push(1.0);
    
    this.color_buffer.push(color[0]);
    this.color_buffer.push(color[1]);
    this.color_buffer.push(color[2]);
    
    // Edges
    for (j = 0.0;j < this.steps; j++) {
        // Para cada vértice definimos su posición
        // Plano
        this.position_buffer.push(0.5*Math.cos(2.0*Math.PI*j/(this.steps-1)));
        this.position_buffer.push(0.5*Math.sin(2.0*Math.PI*j/(this.steps-1)));
        this.position_buffer.push(0.0);

        this.normal_buffer.push(0.0);
        this.normal_buffer.push(0.0);
        this.normal_buffer.push(1.0);
        
        // Para cada vértice definimos su color
        this.color_buffer.push(color[0]);
        this.color_buffer.push(color[1]);
        this.color_buffer.push(color[2]);
    }
}

Circle.prototype.setupIndexBuffer = function() {
    this.index_buffer = [];
    // steps + 1 for the center
    for(i = 0; i < this.steps+1; i++) {
        this.index_buffer.push(i);
    }
}

// Superficie de revolucion arbitraria
SurfaceOfRevolution = function() { }
SurfaceOfRevolution.prototype = new Grid();
// Redefinimos los metodos de datos propios de la figura
// paramFunc es una funcion R -> R en [0, 1]
// dParamFunc es la derivada de paramFunc
SurfaceOfRevolution.prototype.setupModelData = function(cols, rows, color, paramFunc, dParamFunc) {
    this.cols = cols;
    this.rows = rows;

    this.position_buffer = [];
    this.color_buffer = [];
    this.normal_buffer = [];
    
    for (j = 0.0;j < this.rows; j++) {
        for (i = 0.0;i < this.cols; i++) {

            var u = j/(this.rows-1);
            
            this.position_buffer.push(paramFunc(u) * 0.5*Math.cos(2.0*Math.PI*i/(this.cols-1)));
            this.position_buffer.push(paramFunc(u) * 0.5*Math.sin(2.0*Math.PI*i/(this.cols-1)));
            this.position_buffer.push(u);

            // Calcular el normal lleva un poco de trabajo.. normal = tg x o->p
            var normal = vec3.create();
            var tg = vec3.fromValues(dParamFunc(u) * Math.cos(2.0*Math.PI*i/(this.cols-1)),
                                     dParamFunc(u) * Math.sin(2.0*Math.PI*i/(this.cols-1)),
                                     1.0);
            var op = vec3.fromValues(-Math.sin(2.0*Math.PI*i/(this.cols-1)), Math.cos(2.0*Math.PI*i/(this.cols-1)), 0.0);
            vec3.cross(normal, op, tg);
            vec3.normalize(normal, normal);
            this.normal_buffer = this.normal_buffer.concat(normal[0], normal[1], normal[2]);            
            
            this.color_buffer.push(color[0]);
            this.color_buffer.push(color[1]);
            this.color_buffer.push(color[2]);

       }
    }
}

// Clase camara
function Camera() {
    
    // Defaults
    this.cameraPos = vec3.fromValues(2, 2, 2);
    this.cameraDirAzi = 45 * Math.PI/180.0;
    this.cameraDirPolar = -125 * Math.PI/180.0;
    
    // Parametrizacion de la camara
    this.setCamPos = function(x, y, z) {
        this.cameraPos = vec3.fromValues(x, y, z);
    }
    
    // Converts deg to rad
    this.setCamDir = function(azi, polar) {
        this.cameraDirAzi = azi * Math.PI/180.0;
        this.cameraDirPolar = polar * Math.PI/180.0;
    }

    this.getViewMatrix = function() {
        var lookat = vec3.create();
        vMatrix = mat4.create();
        vec3.add(lookat, this.cameraPos, vec3.fromValues(
            Math.sin(this.cameraDirPolar) * Math.cos(this.cameraDirAzi),
            Math.sin(this.cameraDirPolar) * Math.sin(this.cameraDirAzi),
            Math.cos(this.cameraDirPolar)
        ));
        return mat4.lookAt(vMatrix, this.cameraPos, lookat, [0, 0, 1]);
    }
}