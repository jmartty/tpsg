// Precargar cada shader
	//Leer codigo fuente del shader
	src = "shader code foo bar"
	//Crear shader
	shader = gl.createShader();
	//Cargar codigo fuente en shader
	gl.shaderSource(shader, src);
	//Compilar el shader
	gl.compileShader(shader);

// Precargar cada programa
	// Crear el programa
	program = gl.createProgram();
	// Attachear los shaders
	gl.attachShader(program, shader);
	// Linkear el programa
	gl.linkProgram(program);
	
// Precargar cada modelo
	// Crear los buffers locales de indices y vertices (pos, color, etc)
	this.index_buffer = []; 
	this.position_buffer = []; //etc
	
	// Llenar el buffer local
	index_buffer.push(...);
	position_buffer.push(...); // etc
	
	// Crear y cargar los buffers en la GPU
	// Para indices
	// Crear el buffer
	this.webgl_index_buffer = gl.createBuffer();
	// Bindearlo el buffer a ELEMENT_ARRAY_BUFFER
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);
	// Cargar los datos en el buffer
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.index_buffer), gl.STATIC_DRAW);
	
	// Para los atributos de los vertices (repetir para cada)
	// Crear el buffer
	this.webgl_position_buffer = gl.createBuffer();
	// Bindear al ARRAY_BUFFER
	gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
	// Cargar los datos
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.position_buffer), gl.STATIC_DRAW); 

// Dibujar
	// Borrar
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Activar el programa relevante
	gl.useProgram(program);
	
	// Cargar los uniforms
	// Matrices MVP
	// Projection matrix
	var u_proj_matrix = gl.getUniformLocation(glProgram, "uProjectionMatrix");
	mat4.perspective(pMatrix, Math.PI/4, canvas.width/canvas.height, 0.1, 100.0);
	gl.uniformMatrix4fv(u_proj_matrix, false, pMatrix);
	
	// View matrix
	var u_view_matrix = gl.getUniformLocation(glProgram, "uViewMatrix");
	mat4.lookAt(vMatrix, [35, 35, 35], [0, 0, 0], [0, 0, 1]);
	gl.uniformMatrix4fv(u_view_matrix, false, vMatrix);

	// Otros uniforms globales
	
	// Para cada instancia de los modelos
	// Model matrix
	var u_model_matrix = gl.getUniformLocation(glProgram, "uModelMatrix");
	mat4.identity(mMatrix);
	mat4.translate(mMatrix, mMatrix, [-15.0, -15.0, 0.0]);
	//mat4.rotate(mMatrix, mMatrix, Math.sin(tick), [0.0, 0.0, 1.0]);
	gl.uniformMatrix4fv(u_model_matrix, false, mMatrix);
	
	// Otros uniforms de instancia
	
	// Cargar los atributos de los vertices
	// Buscar el id del atributo en el vertex shader
	var vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
	// Activarlo
	gl.enableVertexAttribArray(vertexPositionAttribute);
	// Activar el buffer que tiene la informacion que llena ese atributo
	gl.bindBuffer(gl.ARRAY_BUFFER, this.webgl_position_buffer);
	// Describir el formato del buffer para ese atributo
	gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
	// Repetir para otros atributos
	
	// Cargar los indices
	// Activar el buffer que tiene los indices
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.webgl_index_buffer);

	// Dibujar usando los indices
	gl.drawElements(gl.TRIANGLE_STRIP, this.index_buffer.length, gl.UNSIGNED_SHORT, 0);
