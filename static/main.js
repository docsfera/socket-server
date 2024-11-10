import * as THREE from './three.module.js';

//window.THREE = THREE
// import * as ThreeMeshUI from "./three-mesh-ui.js";

console.log(ThreeMeshUI)
//import * as ThreeMeshUI from "three-mesh-ui";

import {GLTFLoader} from "./GLTFLoader.js"
import { OrbitControls } from './OrbitControls.js'

let test

let yourCardsCount = 0
let apponentCardsCount = 0

let INIT = false


var socket = io()
var form = document.getElementById('form')
var input = document.getElementById('input')
//
form.addEventListener('submit', function (e) {
  e.preventDefault()
  if (input.value) {
    socket.emit('message', {msg: input.value, player: test})
    input.value = ''
  }
})
socket.on('message', function (data) {

  document.querySelectorAll("li").forEach(el => el.style.bottom = +el.style.bottom.replace("px", "") + 15 + "px")

  var item = document.createElement('li')
  item.style.position = "absolute"
  item.style.right = "40px"
  item.style.bottom = "70px"
  item.textContent = data.msg //test + ": " + msg
  item.style.color = (data.player == 1) ? "blue" : "green"
  messages.appendChild(item)
  window.scrollTo(0, document.body.scrollHeight)

  //addCube()
})

socket.on('new player', function(playersCount){
  console.log("ff")
  if(!INIT) init(playersCount)
  INIT = true
  
})

/////// SCENE ////////

const init = playersCount => {
  test = playersCount
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  document.addEventListener("keydown", () => {
    console.log(scene)
  })

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


  function addCube(data){
    console.log(data)
    if(data.playersCount !== playersCount){

      if(playersCount % 2 !== 0){
        console.log("11")

        const cube = scene.getObjectByName("Card_" + data.value).clone()
        scene.add(cube)
        cube.visible = true

        cube.rotation.x = Math.PI
        cube.rotation.y = Math.PI / 2
        cube.rotation.z = - Math.PI / 2
        cube.position.set(5.5 - 3 * apponentCardsCount, 4.5, 2)

        cube.material.color = new THREE.Color(0,1,1)
        cube.value = data.value

        cube.isYours = (playersCount == data.playersCount)
      }else{
        console.log("1")
        const cube2 = scene.getObjectByName("Card_" + data.value).clone()
        scene.add(cube2)
        cube2.visible = true

        cube2.material.color = new THREE.Color(0,0,1)
        cube2.rotation.x = Math.PI
        cube2.rotation.y = Math.PI / 2
        cube2.rotation.z = - Math.PI / 2
        cube2.position.set(-5.5 + 3 * apponentCardsCount, 4.5, -2)
        cube2.value = data.value

        cube2.isYours = (playersCount == data.playersCount)
      }
      apponentCardsCount++

    }else{
      if(playersCount % 2 == 0){
        console.log("22")
        const cube = scene.getObjectByName("Card_" + data.value).clone()
        scene.add(cube)
        cube.visible = true
        cube.rotation.x = Math.PI
        cube.rotation.y = -Math.PI / 2
        cube.rotation.z = - Math.PI / 2
        cube.position.set(-5.5 + 3 * yourCardsCount, 4.5, 2)

        cube.material.color = new THREE.Color(0,1,1)
        cube.value = data.value
        cube.isYours = (playersCount == data.playersCount)
      }else{
        console.log("2")
        const cube2 = scene.getObjectByName("Card_" + data.value).clone()
        scene.add(cube2)
        cube2.visible = true

        cube2.material.color = new THREE.Color(0,0,1)

        cube2.rotation.x = Math.PI
        cube2.rotation.y = Math.PI / 2
        cube2.rotation.z = - Math.PI / 2
        cube2.position.set(5.5 - 3 *yourCardsCount, 4.5, -2)
        cube2.value = data.value
        cube2.isYours = (playersCount == data.playersCount)
      }
      yourCardsCount++
    }

    
    
  }
  document.querySelector("button").innerText = playersCount
  document.querySelector("button").addEventListener("click", () => {
    socket.emit('hit', playersCount)
    
  })


  const countTotal = () => {
    let total = 0
    scene.traverse(child => {
      if(child.name.includes("Card") && child.value && child.isYours == false){
        console.log(child)
        total += child.value
      }
    })
    return total
  }

  socket.on('hit', data => {
    addCube(data)
    scene.getObjectByName("total_text").set({
      content: String(countTotal())
    })
  })


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

    loader.load('./static/3d/trump_nums.glb', function ( gltf ) {
      console.log("cards is loaded")
      scene.add(gltf.scene)
    })


    // TEXT

    const container = new ThreeMeshUI.Block({
        backgroundColor: new THREE.Color(1, 1, 1),
        width: 2,
        height: 2,
        justifyContent: "center",
        textAlign: "center",
        fontFamily: './static/font/Roboto-msdf.json',
        fontTexture: './static/font/Roboto-msdf.png',
        borderRadius: 0, // Убираем радиус границ
    })

    const text = new ThreeMeshUI.Text({
      content: "0",
      fontSize: 1,
      fontColor: new THREE.Color(0, 0, 0)
    })

    text.name = "total_text"

    container.add(text)
    container.rotation.x = - Math.PI / 2
    container.name = "container_total_text"

     if(playersCount % 2 == 0){
      container.position.set(5.5, 4.5, -2)
    }else{
      container.position.set(-5.5, 4.5, 2)
      container.rotation.z = Math.PI
    }
    
    scene.add(container)

    container.traverse( _ => _.visible = true)
  })

  //addCube()

  const controls = new OrbitControls( camera, renderer.domElement );
          //controls.addEventListener( 'change', render ); // use if there is no animation loop
          controls.minDistance = 2;
          controls.maxDistance = 40;
          //controls.target.set( 0, 0, - 0.2 );
          controls.update();

  function animate(){
    ThreeMeshUI.update();
    renderer.render(scene, camera)
  }
}








