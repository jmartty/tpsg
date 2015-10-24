var blue = [ 0, 0, 1 ];
var red = [ 1, 0, 0 ];
var darkgreen = [ 0.5, 0.5, 0 ];
var green = [ 0, 1, 0.5 ];
var grey = [ 0.5, 0.5, 0.5 ];
var yellow = [ 1, 1, 0 ];
var orange = [ 1, 0.6, 0 ];
var pink = [ 1, 0.3, 0.7 ];

function createCylinder(name, color) {
	var cylinder = new Cylinder();
	cylinder.create(name, "lighting");
	cylinder.setupModelData(20, 10, color);
	cylinder.setupIndexBuffer();
	cylinder.setupGLBuffers();
	return cylinder;
}

function createPlane(name, color) {
	var grid = new Grid();
	grid.create(name, "lighting");
	grid.setupModelData(2, 2, color);
	grid.setupIndexBuffer();
	grid.setupGLBuffers();
	return grid;
}

//rueda de la vuelta al mundo
function createWheel(name, parent) {
	var color = grey;
	var cylinder;
	var i;
	for (i=0; i<15 ; i++) {
		//rueda exterior
		cylinder = createCylinder(name+"Arc"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate(i*24, [0.0, 1.0, 0.0]);
		cylinder.translate([2.0, 0.0, -0.425]);
		cylinder.scale([0.1, 0.1, 0.850]);

		//rueda interior
		cylinder = createCylinder(name+"ArcInt"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate(i*24, [0.0, 1.0, 0.0]);
		cylinder.translate([1.0, 0.0, -0.217]);
		cylinder.scale([0.1, 0.1, 0.425]);

		//radios
		cylinder = createCylinder(name+"Radius"+i, color);
		parent.attachChild(cylinder);
		cylinder.rotate(6+(i*24), [0.0, 1.0, 0.0]);

		cylinder.scale([0.1, 0.1, 2]);
	}
	return parent;
}

function createWheelSet(name, parent) {
	var color = grey;
	//cilindo central
	var centralCylinder = createCylinder(name+"CentralCylinder", color);
	parent.attachChild(centralCylinder);
	centralCylinder.rotate(90, [1.0, 0.0, 0.0]);
	centralCylinder.translate([0.0, 0.0, -0.7]);
	centralCylinder.scale([0.3, 0.3, 1.4]);

	//rueda frontal
	var wheel = new SceneNode();
    	wheel.create("wheel", null);
   	createWheel("rueda", wheel);
	wheel.translate([0.0, 0.4, 0.0]);
    	sceneRoot.attachChild(wheel);
	parent.attachChild(wheel);

	//rueda de atras
	wheel = new SceneNode();
	wheel.create("wheel2", null);
   	createWheel("rueda2", wheel);
	wheel.translate([0.0, -0.4, 0.0]);
    	sceneRoot.attachChild(wheel);
	parent.attachChild(wheel);

	//uniones
	var joint;
	var i;
	for (i=0; i<15 ; i++) {
		joint = createCylinder(name+"Joint"+i, color);
		parent.attachChild(joint);
		joint.rotate(i*24, [0.0, 1.0, 0.0]);
		joint.translate([2.0, 0.4, -0.4]);
		joint.rotate(90, [1.0, 0.0, 0.0]);
		joint.scale([0.1, 0.1, 0.8]);
	}

	return parent;	
}

function createBoxSet(name, parent) {
	var i;
	var box;
	var boxcolors = [ blue, green, orange, pink, yellow, red,  darkgreen ];
	for (i=0; i<1 ; i++) {
		box = createBox(name+"Box"+i, parent, boxcolors[i]);
		parent.attachChild(box);
	
	//	box.rotate(i*48, [0.0, 1.0, 0.0]);
	//	box.translate([2.0*i, 0, 0]);

		box.scale([0.2, 0.2, 0.2]);
	}
	return parent;

}
	

function createBox(name, parent, color) {
	//front face
	var face = new SceneNode();
	face.create("frontface", null);
	createBoxFace("frontalface", face, color);
	parent.attachChild(face);
	face.translate([-0.5, -0.5, 0.5]);
//	face.scale([1.03, 1.03, 1.03]); 

	//back face
	face = new SceneNode();
	face.create("backface", null);
	createBoxFace("backcara", face, color);
	parent.attachChild(face);
	face.translate([-0.5, -0.5, -0.5]);
//	face.scale([1.03, 1.03, 1.03]); 

	//side face
	face = new SceneNode();
	face.create("sidef", null);
	createBoxFace("sideface", face, color);
	parent.attachChild(face);
	face.rotate(90, [0.0, 1.0, 0.0]);
	face.translate([-0.5, -0.5, -0.5]);
//	face.scale([1.03, 1.03, 1.03]); 

	//other side face
	face = new SceneNode();
	face.create("sideleft", null);
	createBoxFace("sifeleface", face, color);
	parent.attachChild(face);
	face.rotate(-90, [0.0, 1.0, 0.0]);
	face.translate([-0.5, -0.5, -0.5]);
//	face.scale([1.03, 1.03, 1.03]); 

	//roof
	var grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([-0.5, 1.5, -0.5]);
	grid.rotate(90, [1.0, 0.0, 0.0]);
//	grid.scale([1.03, 1.03, 1.03]); 

	//floor
	grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([-0.5, -0.5, -0.5]);
	grid.rotate(90, [1.0, 0.0, 0.0]);
//	grid.scale([1.0, 1.0, 1.0]); 

	return parent;
       	
}

function createBoxFace(name, parent, color) {
	//main grid
	var grid = createPlane(name, color);
	parent.attachChild(grid);

	//left grid
	grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([0.0, 1, 0.0]);
	grid.scale([0.2, 1, 1]); 

	//right grid
	grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([0.8, 1, 0.0]);
	grid.scale([0.2, 1, 1]); 

	//top grid
	grid = createPlane(name, color);
	parent.attachChild(grid);
	grid.translate([0, 1.8, 0.0]);
	grid.scale([1, 0.2, 1]); 
	
	return parent;
}


