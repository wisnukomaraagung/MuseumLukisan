/**
 * PointerLockControls – Three.js r128 compatible
 * First-person camera controller
 */
THREE.PointerLockControls = function ( camera, domElement ) {
	if ( domElement === undefined ) domElement = document.body;
	this.domElement = domElement;
	this.isLocked = false;
	this.minPolarAngle = 0.1;
	this.maxPolarAngle = Math.PI - 0.1;

	const scope = this;
	const changeEvent = { type: 'change' };
	const lockEvent   = { type: 'lock' };
	const unlockEvent = { type: 'unlock' };

	const euler = new THREE.Euler( 0, 0, 0, 'YXZ' );
	const PI_2  = Math.PI / 2;
	const vec   = new THREE.Vector3();

	function onMouseMove( e ) {
		if ( !scope.isLocked ) return;
		const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
		const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
		euler.setFromQuaternion( camera.quaternion );
		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;
		euler.x  = Math.max( PI_2 - scope.maxPolarAngle, Math.min( PI_2 - scope.minPolarAngle, euler.x ) );
		camera.quaternion.setFromEuler( euler );
		scope.dispatchEvent( changeEvent );
	}

	function onPointerlockChange() {
		if ( scope.domElement.ownerDocument.pointerLockElement === scope.domElement ) {
			scope.dispatchEvent( lockEvent );
			scope.isLocked = true;
		} else {
			scope.dispatchEvent( unlockEvent );
			scope.isLocked = false;
		}
	}

	function onPointerlockError() { console.error( 'PointerLockControls: Unable to use Pointer Lock API' ); }

	this.connect = function () {
		scope.domElement.ownerDocument.addEventListener( 'mousemove', onMouseMove );
		scope.domElement.ownerDocument.addEventListener( 'pointerlockchange', onPointerlockChange );
		scope.domElement.ownerDocument.addEventListener( 'pointerlockerror',  onPointerlockError );
	};

	this.disconnect = function () {
		scope.domElement.ownerDocument.removeEventListener( 'mousemove', onMouseMove );
		scope.domElement.ownerDocument.removeEventListener( 'pointerlockchange', onPointerlockChange );
		scope.domElement.ownerDocument.removeEventListener( 'pointerlockerror',  onPointerlockError );
	};

	this.dispose = this.disconnect;

	this.getObject = function () { return camera; };

	this.getDirection = ( function () {
		const dir = new THREE.Vector3( 0, 0, -1 );
		return function ( v ) { return v.copy( dir ).applyQuaternion( camera.quaternion ); };
	}() );

	this.moveForward = function ( dist ) {
		vec.setFromMatrixColumn( camera.matrix, 0 );
		vec.crossVectors( camera.up, vec );
		camera.position.addScaledVector( vec, dist );
	};

	this.moveRight = function ( dist ) {
		vec.setFromMatrixColumn( camera.matrix, 0 );
		camera.position.addScaledVector( vec, dist );
	};

	this.lock = function () { scope.domElement.requestPointerLock(); };
	this.unlock = function () { scope.domElement.ownerDocument.exitPointerLock(); };

	this.connect();
};

THREE.PointerLockControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.PointerLockControls.prototype.constructor = THREE.PointerLockControls;
