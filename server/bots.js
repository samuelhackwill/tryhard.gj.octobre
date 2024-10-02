import { randomBetween, positionOnCircle } from "../both/math-helpers.js"

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

    p.dirty = true;
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