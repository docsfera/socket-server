import * as THREE from 't.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


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
      })