import * as THREE from './three.module.js';

import {GLTFLoader} from "./GLTFLoader.js"


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

renderer.setClearColor(0xEEEEEE)

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

camera.position.z = 5
camera.position.y = 9

function addCube(){
  const cube = new THREE.Mesh( geometry, material );
  scene.add( cube );
  cube.position.set(Math.random() * 2, Math.random() * 2 + 5, Math.random() * 2)
}


const loader = new GLTFLoader();
loader.load('./static/3d/table.glb', function ( gltf ) {
  scene.add( gltf.scene );


  const pos = new THREE.Vector3(gltf.scene.position.x, gltf.scene.position.y + 1, gltf.scene.position.z -5)
  camera.lookAt(pos)
  console.log(scene)

  gltf.scene.position.y = -2

  const light = new THREE.AmbientLight( 0xffffff );
  light.intensity = 2
  scene.add( light );
})

addCube()

function animate() {

  // cube.rotation.x += 0.01;
  // cube.rotation.y += 0.01;

  renderer.render( scene, camera );

}


var socket = io()
var form = document.getElementById('form')
var input = document.getElementById('input')

form.addEventListener('submit', function (e) {
  e.preventDefault()
  if (input.value) {
    socket.emit('message', input.value)
    input.value = ''
  }
})
socket.on('message', function (msg) {
  var item = document.createElement('li')
  item.textContent = msg
  messages.appendChild(item)
  window.scrollTo(0, document.body.scrollHeight)

  addCube()
})

