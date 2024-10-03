import { randomBetween, positionOnCircle, randomPointInArea } from "../both/math-helpers.js"

//Send pointers to the edge of a rectangular area
export const sendToSides = function(pointers, area) {
  //Move the bots to random position on either side of the screen
  pointers = pointers.map(p => {
    //Half of them will go left, half will go right
    if(Math.random() > 0.5) {
      p.coords.x = randomBetween(0, 200); //up to 200px from the edge
    } else {
      p.coords.x = randomBetween(area.width-200, area.width);
    }
    p.coords.y = Math.round(Math.random() * area.height);

    //Store these coords as "home coordinates", so we can easily go back to them later
    p.homeCoords = {...p.coords};
    return p;
  })
} 

//A proof of concept "choreography" to test the bot AI logic
export const circleRoutine = function(pointers) {
    for(let i = 0; i < pointers.length; i++)
    {
      //Wait for a moment
      pointers[i].events.push({
        type: "wait", 
        duration: randomBetween(500,5000),
      })
  
      //Move to a position on a circle
      pointers[i].events.push({
        type: "humanizedMove", 
        duration: randomBetween(1100, 2100),
        from: null,
        to: positionOnCircle({x:400,y:400}, 150, (i/pointers.length) * 360),
      })
  
      //Wait, but wiggle while waiting
      pointers[i].events.push({
        type: "humanizedMove", 
        duration: randomBetween(5000, 6000),
        from: null,
        to: null,
      })
  
      //Go "home"
      pointers[i].events.push({
        type: "humanizedMove", 
        duration: randomBetween(1100, 2100),
        from: null,
        to: pointers[i].homeCoords,
      })
    }
  }

export const dressupAnimation = function(pointer, accessory) {
  pointer.events.push({type:"fade", from:null, to:0, duration:150})
  pointer.events.push({type:"lock", state:true})
  pointer.events.push({type:"wait", duration:800})
  pointer.events.push({type:"accessory", accessory:accessory})
  pointer.events.push({type:"fade", from:null, to:1, duration:150})
  pointer.events.push({type:"move", from:null, to:{x:pointer.coords.x + 80, y:pointer.coords.y}, duration:350})
  pointer.events.push({type:"lock", state:false})
}
export const treePickUpAnimation = function(pointer, tree) {
  pointer.events.push({type:"fade", from:null, to:0, duration:150})
  pointer.events.push({type:"lock", state:true})
  pointer.events.push({type:"wait", duration:800})
  pointer.events.push({type:"tree", tree:tree})
  pointer.events.push({type:"fade", from:null, to:1, duration:150})
  pointer.events.push({type:"move", from:null, to:{x:pointer.coords.x + 80, y:pointer.coords.y}, duration:350})
  pointer.events.push({type:"lock", state:false})
}

const idleRoutines = [
  {
    weight: 2,
    apply: function(pointer){
      //Go dress up
      //- Move there
      let targetCoords = randomPointInArea(document.querySelector("#folderVestiaire").getBoundingClientRect());
      pointer.events.push({
        type:"humanizedMove",
        from:null,
        to:targetCoords,
        duration:randomBetween(1200,1800)}
      )
      //- Click
      pointer.events.push({type:"bufferClick"})
    }
  },
  {
    weight: 1,
    apply: function(pointer){
      //Go hit the plus button, a bunch of times
      let amount = randomBetween(1,11)
      for(let i = 0; i < amount; i++)
      {
        //- Move there
        let targetCoords = randomPointInArea(document.querySelector("#plusminus-plus").getBoundingClientRect());
        pointer.events.push({
          type:"humanizedMove",
          from:null,
          to:targetCoords,
          duration:randomBetween(1200,1800)}
        )
        //- Click
        pointer.events.push({type:"bufferClick"})
        //- Wait
        pointer.events.push({type:"wait", duration:randomBetween(500,1300)})
      }
    }
  },
  {
    weight: 1,
    apply: function(pointer){
      //Go hit the plus button, a bunch of times
      let amount = randomBetween(1,11)
      for(let i = 0; i < amount; i++)
      {
        //- Move there
        let targetCoords = randomPointInArea(document.querySelector("#plusminus-minus").getBoundingClientRect());
        pointer.events.push({
          type:"humanizedMove",
          from:null,
          to:targetCoords,
          duration:randomBetween(1200,1800)}
        )
        //- Click
        pointer.events.push({type:"bufferClick"})
        //- Wait
        pointer.events.push({type:"wait", duration:randomBetween(500,1300)})
      }
    }
  },
  {
    weight: 100,
    apply: function(pointer){
      //Go sit
      pointer.events.push({type:"humanizedMove", from:null, to:pointer.homeCoords??{x:0,y:0}, duration:randomBetween(2000,3000)})
      //Wiggly wait
      pointer.events.push({type:"humanizedMove", from:null, to:null, duration:randomBetween(2000,3000)})
    }
  },
  {
    weight: 800,
    apply: function(pointer){
      //Wait
      pointer.events.push({type:"wait", duration:randomBetween(500,1200)})
    }
  }
]
export const getRandomIdleRoutine = function(pointer) {
  //Sum all the weights of all the routines
  let totalWeights = idleRoutines.reduce( (sum, n) => sum + n.weight, 0 );
  //Pick a random number
  let pick = randomBetween(0, totalWeights)
  //Look through every routine, subtracting its weight score until pick reaches 0
  let currentIndex = 0
  do {
    pick -= idleRoutines[currentIndex].weight
    //Once we reach 0: apply that routine
    if(pick <= 0) idleRoutines[currentIndex].apply(pointer)
    currentIndex++
  } while (pick > 0)
  
  //This isn't super readable but:
  // it picks a random routine, with proportionally chance to pick one with a high weight
}

export const killAnimation = function(pointer) {
  pointer.events = []
  pointer.tree = null
  pointer.locked = true
  pointer.gravity = 400
  pointer.opacity = 0.75
  pointer.accessory = "💀"
}