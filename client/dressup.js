//The dressing
export const accessories = [
    ...["👓","🕶️","🥽"],
    ...["🥼","🦺","👔","👕","🧥","👗","👘","🩱","👙","👚"],
    ...["👖","🩲","🩳"],
    ...["🧦","🩴","👞","👟","🥾","🥿","👠","👡","🩰","👢"],
    //...["🧤","👛","👜","👝","🛍️","🎒"],
    ...["👑","👒","🎩","🎓","🧢","🪖"]
]

//Return a random accessory
export const getRandomAccessory = function() {
    let pick = Math.floor(Math.random() * accessories.length)
    return accessories[pick]
}

//Apply a random accessory to the given pointer
export const applyRandomAccessory = function( pointer ) {
    pointer.accessory = getRandomAccessory()
} 