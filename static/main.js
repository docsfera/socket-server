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
  item.style.color = (data.player == 1) ? "blue" : "grown"
  if(data.player == -1) item.style.color = "red"
  if(data.player == 0) item.style.color = "green"
  messages.appendChild(item)
  window.scrollTo(0, document.body.scrollHeight)

  //addCube()
})

socket.on('new player', function(playersCount){
  console.log("ff")
  if(!INIT) init(playersCount)
  INIT = true

  if(playersCount > 1){
    document.querySelector("#waiter").style.display = "none"
    document.querySelector("#accepter").style.display = "flex"
  }
  
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

  // Vertex Shader
const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Fragment Shader
const fragmentShader = `
uniform float uTime;
varying vec2 vUv;

void main() {
    // Normalized UV coordinates (from 0 to 1)
    vec2 uv = vUv;
    
    // Time varying for animation
    float t = uTime * 0.5;
    
    // Create water waves using sine functions
    vec2 wave = vec2(
        sin(uv.x * 10.0 + t) * 0.05,
        sin(uv.y * 8.0 + t * 1.1) * 0.03
    );
    
    // Add some noise for more organic ripples
    float noise = fract(sin(dot(uv + t * 0.1, vec2(12.9898,78.233))) * 43758.5453) * 0.1;
    
    // Distort UV coordinates for ripples
    vec2 distortedUV = uv + wave;
    
    // Base water color (blue-green gradient)
    vec3 baseColor = vec3(0.0, 0.3, 0.6); // Deep blue
    vec3 shallowColor = vec3(0.0, 0.5, 0.8); // Lighter blue-green
    
    // Mix colors based on depth (simulated by y-coordinate)
    float depth = smoothstep(0.0, 1.0, distortedUV.y);
    vec3 waterColor = mix(shallowColor, baseColor, depth);
    
    // Add reflection effect using sine waves
    float reflection = sin(distortedUV.x * 20.0 + distortedUV.y * 20.0 + t * 2.0) * 0.5 + 0.5;
    waterColor = mix(waterColor, vec3(1.0), reflection * 0.3); // Add white highlights
    
    // Add foam at the edges (top of water)
    float foam = smoothstep(0.9, 1.0, distortedUV.y);
    waterColor = mix(waterColor, vec3(1.0), foam * 0.2);
    
    // Add subtle specular highlights
    float specular = pow(max(0.0, reflection), 10.0);
    waterColor += vec3(1.0) * specular * 0.5;
    
    // Output to screen
    gl_FragColor = vec4(waterColor, 1.0);
}
`;


  const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0.0 } // Время для анимации
    }
});

  const shaderPlane = new THREE.Mesh(new THREE.PlaneGeometry(100,100,100), waterMaterial)
  shaderPlane.rotation.x = -Math.PI / 2
  shaderPlane.position.y = -2

  //scene.add(shaderPlane)

  let hidedMaterial


  if(playersCount % 2 == 0){
    camera.position.z = 5
    camera.position.y = 9
  }else{
    camera.position.z = -5
    camera.position.y = 9
  }


  function addCube(data){
    console.log(data)

    const cube = scene.getObjectByName("Card_" + data.value).clone()
    const cube2 = scene.getObjectByName("Card_" + data.value).clone()
    cube.scale.set(0.05, 0.8, 0.8)
    cube2.scale.set(0.05, 0.8, 0.8)

    if(data.playersCount !== playersCount){
      if(playersCount % 2 !== 0){
        console.log("11")

        scene.add(cube)
        cube.visible = true

        cube.rotation.x = Math.PI
        cube.rotation.y = Math.PI / 2
        cube.rotation.z = - Math.PI / 2
        cube.position.set(5.5 - 1.85 * apponentCardsCount, 4.5, 2)

        cube.material.color = new THREE.Color(0,1,1)
        cube.value = data.value

        cube.isYours = (playersCount == data.playersCount)

        if(apponentCardsCount == 0){
          hidedMaterial = cube.material.clone()
          cube.material = new THREE.MeshBasicMaterial({color: "#3A3C3E"})
          cube.isFirst = true
        }
      }else{
        console.log("1")
        
        scene.add(cube2)
        cube2.visible = true

        cube2.material.color = new THREE.Color(0,0,1)
        cube2.rotation.x = Math.PI
        cube2.rotation.y = Math.PI / 2
        cube2.rotation.z = - Math.PI / 2
        cube2.position.set(-5.5 + 1.85 * apponentCardsCount, 4.5, -2)
        cube2.value = data.value

        cube2.isYours = (playersCount == data.playersCount)

        if(apponentCardsCount == 0){
          hidedMaterial = cube2.material.clone()
          cube2.material = new THREE.MeshBasicMaterial({color: "#3A3C3E"})
          cube2.isFirst = true
        }
      }
      apponentCardsCount++

    }else{
      if(playersCount % 2 == 0){
        console.log("22")
        scene.add(cube)
        cube.visible = true
        cube.rotation.x = Math.PI
        cube.rotation.y = -Math.PI / 2
        cube.rotation.z = - Math.PI / 2
        cube.position.set(-5.5 + 1.85 * yourCardsCount, 4.5, 2)

        cube.material.color = new THREE.Color(0,1,1)
        cube.value = data.value
        cube.isYours = (playersCount == data.playersCount)
      }else{
        console.log("2")
        scene.add(cube2)
        cube2.visible = true

        cube2.material.color = new THREE.Color(0,0,1)

        cube2.rotation.x = Math.PI
        cube2.rotation.y = Math.PI / 2
        cube2.rotation.z = - Math.PI / 2
        cube2.position.set(5.5 - 1.85 *yourCardsCount, 4.5, -2)
        cube2.value = data.value
        cube2.isYours = (playersCount == data.playersCount)
      }
      yourCardsCount++
    }
  }

  document.querySelector("button").innerText = playersCount
  document.querySelector(".hit").addEventListener("click", () => {
    socket.emit('hit', playersCount)
  })
  document.querySelector(".skip").addEventListener("click", () => {
    socket.emit('skip', playersCount)
  })
  document.querySelector(".ready").addEventListener("click", () => {
    socket.emit('ready', playersCount)
  })

  socket.on('ready', data => {
    console.log(data)
    document.querySelector(".accept-" + data.playersCount).style.background = "green"
    if(data.playersReady.length > 1){

      document.querySelector("#accepter").style.display = "none"
      socket.emit('hit', playersCount)
      socket.emit('hit', playersCount)
    }
  })


  const countTotal = () => {
    let total = 0
    scene.children.map(child => {
      if(child.name.includes("Card") && child.value && child.isYours == false && !child.isFirst){
        console.log(child.value)
        total += child.value
      }
    })
    return total
  }

  socket.on('hit', data => {
    //console.log({playersCount, order: data.order})
    console.log(data.order)
    if(playersCount == data.order){
      document.querySelector(".hit").style.background = "green"
    }else{
      document.querySelector(".hit").style.background = "red"
    }
    addCube(data)
    scene.getObjectByName("total_text").set({
      content: String(countTotal()) + "/21"
    })
  })

  socket.on("skip", order => {
    if(playersCount == order){
      document.querySelector(".hit").style.background = "green"
    }else{
      document.querySelector(".hit").style.background = "red"
    }
  })

  socket.on("end" , (data) => {
    console.log("ENDDDD")

    scene.children.map(child => {
      if(child.isFirst){
        child.material = hidedMaterial
        child.isFirst = false
        scene.getObjectByName("total_text").set({
          content: String(countTotal()) + "/21"
        })
        setTimeout(() => {
          document.querySelector("#accepter").style.display = "flex"
          document.querySelector(".accept-1").style.background = "red"
          document.querySelector(".accept-2").style.background = "red"


          document.querySelector("#score").innerText = data.wins1 + "/" + data.wins2

          scene.children.map(ch => {
            if(ch.name.includes("Card")) {
              setTimeout(() => ch.removeFromParent(), 0)
              yourCardsCount = 0
              apponentCardsCount = 0

            }
          })

        }, 4000)
      }
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

    loader.load('./static/3d/Terrain_Free_001.glb', function ( gltf ) {
      console.log("cards is loaded")
      scene.add(gltf.scene)

      console.log("p---")
      console.log(gltf.scene)

      gltf.scene.traverse(child => {
        if( child.material) child.material = new THREE.MeshStandardMaterial({color: "#00ff00"})
      })
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
      fontSize: 0.6,
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

    // TODO: bit later
    // setTimeout(() => {
    //   socket.emit('hit', playersCount)
    //   socket.emit('hit', playersCount)
    // }, 1000)


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
    waterMaterial.uniforms.uTime.value += 0.01;
    renderer.render(scene, camera)
  }
}








