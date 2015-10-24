function createCylinder(name, color) {
	var cylinder = new Cylinder();
	cylinder.create(name, "lighting");
	cylinder.setupModelData(20, 10, color);
	cylinder.setupIndexBuffer();
	cylinder.setupGLBuffers();
	return cylinder;
}

//rueda de la vuelta al mundo
function createWheel(name, parent) {
	var color = [ 0, 0, 0.5 ];
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

function createWheelBoxSet(name, parent) {
	var color = [ 0, 0, 0.5 ];
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


