import * as THREE from './three.module.js';

import {GLTFLoader} from "./GLTFLoader.js"
import { OrbitControls } from './OrbitControls.js'

let test

let INIT = false

const init = playersCount => {
  test = playersCount
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop( animate );
  document.body.appendChild( renderer.domElement );

  renderer.setClearColor(0xEEEEEE)

  const geometry = new THREE.BoxGeometry( 0.8, 0.1, 1 );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );


  if(playersCount % 2 == 0){
    camera.position.z = 5
    camera.position.y = 9
  }else{
    camera.position.z = -5
    camera.position.y = 9
  }


  function addCube(){
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    cube.position.set(-5.5, 4.5, 2)


    const cube2 = new THREE.Mesh( geometry, material.clone() );
    cube2.material.color = new THREE.Color(0,0,1)
    scene.add( cube2 );
    cube2.position.set(5.5, 4.5, -2)
  }


  const loader = new GLTFLoader();
  loader.load('./static/3d/table.glb', function ( gltf ) {
    scene.add( gltf.scene );

    let pos

    if(playersCount % 2 == 0){
      pos = new THREE.Vector3(gltf.scene.position.x, gltf.scene.position.y + 1, gltf.scene.position.z -5)
    }else{
      pos = new THREE.Vector3(gltf.scene.position.x, gltf.scene.position.y + 1, gltf.scene.position.z +5)
    } 
    camera.lookAt(pos)
    console.log(scene)

    gltf.scene.position.y = -2

    const light = new THREE.AmbientLight( 0xffffff );
    light.intensity = 2
    scene.add( light );
  })

  addCube()

  const controls = new OrbitControls( camera, renderer.domElement );
          //controls.addEventListener( 'change', render ); // use if there is no animation loop
          controls.minDistance = 2;
          controls.maxDistance = 40;
          //controls.target.set( 0, 0, - 0.2 );
          controls.update();

  function animate(){
    renderer.render(scene, camera)
  }
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

  document.querySelectorAll("li").forEach(el => el.style.bottom = +el.style.bottom.replace("px", "") + 15 + "px")

  var item = document.createElement('li')
  item.style.position = "absolute"
  item.style.right = "40px"
  item.style.bottom = "70px"
  item.textContent = msg //test + ": " + msg
  item.style.color = "green"
  document.querySelector("messages").appendChild(item)
  window.scrollTo(0, document.body.scrollHeight)

  //addCube()
})

socket.on('new player', function(playersCount){
  console.log("ff")
  if(!INIT) init(playersCount)
  INIT = true
  
})

